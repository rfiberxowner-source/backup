Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\website\ChatGPT Image Jul 25, 2026, 04_15_31 PM.png")
$bmp = New-Object System.Drawing.Bitmap 1024, 1024
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, 1024, 1024)
$bmp.Save("C:\website\public\app_icon_1024.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$img.Dispose()
