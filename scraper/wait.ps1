$proc = Get-Process -Id 33661 -ErrorAction SilentlyContinue
$elapsed = 0
while ($proc -and $elapsed -lt 600) {
  Start-Sleep -Seconds 10
  $elapsed += 10
  $proc = Get-Process -Id 33661 -ErrorAction SilentlyContinue
  $subs = (Get-Content D:\kaifa_stu\world_website\data\_subpages.json -Raw -ErrorAction SilentlyContinue) | ConvertFrom-Json -ErrorAction SilentlyContinue
  $imgCount = 0; if (Test-Path D:\kaifa_stu\world_website\public\assets\images) { $imgCount = (Get-ChildItem D:\kaifa_stu\world_website\public\assets\images).Count }
  Write-Host ("[{0}s] alive={1} subpages={2} images={3}" -f $elapsed, [bool]$proc, ($subs.Count), $imgCount)
}
Write-Host "DONE after $elapsed seconds. Final:"
if (Test-Path D:\kaifa_stu\world_website\data\articles.json) { Write-Host "  articles.json size: $((Get-Item D:\kaifa_stu\world_website\data\articles.json).Length)" }
if (Test-Path D:\kaifa_stu\world_website\data\_subpages.json) { Write-Host "  subpages count: $((Get-Content D:\kaifa_stu\world_website\data\_subpages.json -Raw | ConvertFrom-Json).Count)" }
$imgCount = 0; if (Test-Path D:\kaifa_stu\world_website\public\assets\images) { $imgCount = (Get-ChildItem D:\kaifa_stu\world_website\public\assets\images).Count }
Write-Host "  total images: $imgCount"
