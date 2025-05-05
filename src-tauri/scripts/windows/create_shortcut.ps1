param(
    [Parameter(Mandatory = $true)]
    [string]$TargetPath,
    
    [Parameter(Mandatory = $true)]
    [string]$ShortcutName,
    
    [Parameter(Mandatory = $true)]
    [string]$ShortcutLocation,

    [Parameter(Mandatory = $false)]
    [string]$IconPath = $TargetPath,
    
    [Parameter(Mandatory = $false)]
    [string]$Description,

    [Parameter(Mandatory = $false)]
    [string]$Arguments
)


# Create a WScript Shell object to create the shortcut
$WshShell = New-Object -ComObject WScript.Shell
# Get the shortcut location path
$ShortcutLocation = if ($ShortcutLocation -eq "desktop") { [System.Environment]::GetFolderPath('Desktop') } else {
    "$([System.Environment]::GetFolderPath('StartMenu'))\Programs"
}

# Create the full path for the shortcut
$ShortcutFullPath = Join-Path -Path $ShortcutLocation -ChildPath $ShortcutName

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