param(
    [Parameter(Mandatory=$true)]
    [string]$TargetPath,
    
    [Parameter(Mandatory=$true)]
    [string]$ShortcutName,
    
    [Parameter(Mandatory=$false)]
    [string]$IconPath = $TargetPath,
    
    [Parameter(Mandatory=$false)]
    [string]$Description,

    [Parameter(Mandatory=$false)]
    [string]$Arguments
)


# Create a WScript Shell object to create the shortcut
$WshShell = New-Object -ComObject WScript.Shell
# Get the desktop path
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')

# Create the full path for the shortcut
$ShortcutFullPath = Join-Path -Path $DesktopPath -ChildPath $ShortcutName

# Create the shortcut object
$Shortcut = $WshShell.CreateShortcut($ShortcutFullPath)

# Set the shortcut properties
$Shortcut.TargetPath = $TargetPath
$Shortcut.WorkingDirectory = [System.IO.Path]::GetDirectoryName($TargetPath)
$Shortcut.IconLocation = $IconPath
if ($Description) {
    $Shortcut.Description = $Description
}

if ($Arguments) {
    $Shortcut.Arguments = $Arguments
}

# Save the shortcut
$Shortcut.Save() 