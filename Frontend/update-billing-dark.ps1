# Update AdminBilling.jsx for dark mode
$filePath = "src/pages/admin/AdminBilling.jsx"
$content = Get-Content $filePath -Raw

# Replace text colors
$content = $content -replace 'text-gray-900', 'text-[var(--admin-text-primary)]'
$content = $content -replace 'text-gray-400', 'text-[var(--admin-text-secondary)]'
$content = $content -replace 'text-gray-500', 'text-[var(--admin-text-secondary)]'
$content = $content -replace 'text-gray-700', 'text-[var(--admin-text-primary)]'

# Replace border colors
$content = $content -replace 'border-gray-100', 'border-[var(--border-subtle)]'
$content = $content -replace 'border-gray-50', 'border-[var(--border-subtle)]'

# Save
Set-Content -Path $filePath -Value $content -NoNewline
Write-Host "AdminBilling.jsx updated for dark mode!" -ForegroundColor Green
