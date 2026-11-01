param (
    [string]$BaseUrl = "http://localhost:8080/api"
)

$script:passed = 0
$script:failed = 0

function Invoke-LibraryApi {
    param (
        [string]$Path,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )

    $request = @{
        Uri = "$BaseUrl$Path"
        Method = $Method
        TimeoutSec = 15
    }
    if ($null -ne $Body) {
        $request.Body = $Body | ConvertTo-Json -Depth 8
        $request.ContentType = "application/json"
    }
    if ($Headers.Count -gt 0) {
        $request.Headers = $Headers
    }
    Invoke-RestMethod @request
}

function Report-Check {
    param ([string]$Name, [bool]$Condition, [string]$Detail = "")

    if ($Condition) {
        $script:passed++
        Write-Host " [PASS] $Name" -ForegroundColor Green
    } else {
        $script:failed++
        Write-Host " [FAIL] $Name" -ForegroundColor Red
    }
    if ($Detail) { Write-Host "        $Detail" -ForegroundColor DarkGray }
}

function Test-RequestDenied {
    param (
        [string]$Path,
        [string]$Method,
        [hashtable]$Headers,
        [object]$Body = $null
    )
    try {
        Invoke-LibraryApi -Path $Path -Method $Method -Headers $Headers -Body $Body | Out-Null
        return $false
    } catch {
        return $true
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Role and Seat Lifecycle API Tests: $BaseUrl" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

try {
    $health = Invoke-LibraryApi -Path "/library/occupancy"
    Report-Check "Occupancy API is available" ($health.success -eq $true)

    $studentLogin = Invoke-LibraryApi -Path "/auth/login" -Method "POST" -Body @{
        identifier = "22A91A0502"; password = "password123"; role = "STUDENT"
    }
    $librarianLogin = Invoke-LibraryApi -Path "/auth/login" -Method "POST" -Body @{
        identifier = "LIB001"; password = "password123"; role = "LIBRARIAN"
    }
    $adminLogin = Invoke-LibraryApi -Path "/auth/login" -Method "POST" -Body @{
        identifier = "ADM001"; password = "password123"; role = "ADMIN"
    }

    $studentHeaders = @{ Authorization = "Bearer $($studentLogin.data.token)" }
    $librarianHeaders = @{ Authorization = "Bearer $($librarianLogin.data.token)" }
    $adminHeaders = @{ Authorization = "Bearer $($adminLogin.data.token)" }
    $rolesValid = $studentLogin.data.user.role -eq "STUDENT" `
        -and $librarianLogin.data.user.role -eq "LIBRARIAN" `
        -and $adminLogin.data.user.role -eq "ADMIN"
    Report-Check "Student, librarian, and admin log in separately" $rolesValid

    $wrongRoleDenied = Test-RequestDenied -Path "/auth/login" -Method "POST" -Headers @{} -Body @{
        identifier = "LIB001"; password = "password123"; role = "ADMIN"
    }
    Report-Check "Account cannot sign in under a different role" $wrongRoleDenied

    $adminDeniedLibrarian = Test-RequestDenied -Path "/librarian/dashboard" -Method "GET" -Headers $adminHeaders
    $librarianDeniedAdmin = Test-RequestDenied -Path "/admin/students" -Method "GET" -Headers $librarianHeaders
    Report-Check "Admin and librarian permissions are separated" ($adminDeniedLibrarian -and $librarianDeniedAdmin)

    $student = Invoke-LibraryApi -Path "/auth/me" -Headers $studentHeaders
    if ($student.data.isInside) {
        Invoke-LibraryApi -Path "/library/scan" -Method "POST" -Headers $studentHeaders -Body @{
            studentId = $student.data.studentId; scanMethod = "MANUAL_VERIFICATION"
        } | Out-Null
    }
    $existingReservation = Invoke-LibraryApi -Path "/reservations/me" -Headers $studentHeaders
    if ($existingReservation.data) {
        Invoke-LibraryApi -Path "/reservations/$($existingReservation.data.id)" -Method "DELETE" -Headers $studentHeaders | Out-Null
    }

    $seatList = Invoke-LibraryApi -Path "/library/seats"
    $seat = $seatList.data | Where-Object { $_.status -eq "AVAILABLE" } | Select-Object -First 1
    if (-not $seat) { throw "No available seat is available for the lifecycle test." }

    $librarianBookingDenied = Test-RequestDenied -Path "/reservations" -Method "POST" -Headers $librarianHeaders -Body @{
        seatId = $seat.id
    }
    Report-Check "Librarian cannot reserve a seat for themselves" $librarianBookingDenied

    $reservation = Invoke-LibraryApi -Path "/reservations" -Method "POST" -Headers $studentHeaders -Body @{
        seatId = $seat.id
    }
    Report-Check "Student reservation holds seat as RESERVED" ($reservation.data.seat.status -eq "RESERVED")

    Invoke-LibraryApi -Path "/librarian/reservations/$($reservation.data.id)" -Method "DELETE" -Headers $librarianHeaders | Out-Null
    $releasedSeat = (Invoke-LibraryApi -Path "/library/seats").data |
        Where-Object { $_.id -eq $seat.id } | Select-Object -First 1
    Report-Check "Librarian can cancel a pending student reservation" ($releasedSeat.status -eq "AVAILABLE")

    $assignment = Invoke-LibraryApi -Path "/librarian/reservations" -Method "POST" -Headers $librarianHeaders -Body @{
        studentId = $student.data.studentId; seatId = $seat.id
    }
    $entry = Invoke-LibraryApi -Path "/librarian/scan" -Method "POST" -Headers $librarianHeaders -Body @{
        studentId = $student.data.studentId; scanMethod = "MANUAL_VERIFICATION"
    }
    $occupiedSeat = (Invoke-LibraryApi -Path "/library/seats").data |
        Where-Object { $_.id -eq $seat.id } | Select-Object -First 1
    $autoOccupied = $entry.data.action -eq "ENTRY" -and $occupiedSeat.status -eq "OCCUPIED" `
        -and $occupiedSeat.currentUser.id -eq $student.data.id
    Report-Check "Student entry verification automatically occupies assigned seat" $autoOccupied

    $occupiedCancellationDenied = Test-RequestDenied -Path "/librarian/reservations/$($assignment.data.id)" -Method "DELETE" -Headers $librarianHeaders
    Report-Check "Librarian cannot cancel an occupied seat while student is inside" $occupiedCancellationDenied

    $exit = Invoke-LibraryApi -Path "/librarian/scan" -Method "POST" -Headers $librarianHeaders -Body @{
        studentId = $student.data.studentId; scanMethod = "MANUAL_VERIFICATION"
    }
    $availableSeat = (Invoke-LibraryApi -Path "/library/seats").data |
        Where-Object { $_.id -eq $seat.id } | Select-Object -First 1
    $autoReleased = $exit.data.action -eq "EXIT" -and $availableSeat.status -eq "AVAILABLE" `
        -and $null -eq $availableSeat.currentUser
    Report-Check "Student exit verification automatically releases seat" $autoReleased
} catch {
    Report-Check "API workflow completed" $false $_.Exception.Message
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Test Summary: $script:passed Passed, $script:failed Failed" -ForegroundColor $(if ($script:failed -eq 0) { "Green" } else { "Red" })
Write-Host "==========================================================" -ForegroundColor Cyan

if ($script:failed -gt 0) { exit 1 }
