# Update Admin Pages Dark Mode Script
# This script replaces hardcoded Tailwind dark mode classes with CSS variables

$adminPagesPath = "src/pages/admin"
$adminComponentsPath = "src/components/admin"

# Define replacement patterns
$replacements = @(
    # Background colors
    @{ Pattern = 'bg-white dark:bg-slate-700'; Replacement = 'bg-[var(--admin-bg-secondary)]' },
    @{ Pattern = 'bg-white dark:bg-slate-800'; Replacement = 'bg-[var(--admin-bg-secondary)]' },
    @{ Pattern = 'bg-slate-50 dark:bg-slate-800'; Replacement = 'bg-[var(--admin-bg-primary)]' },
    @{ Pattern = 'bg-slate-50 dark:bg-slate-900'; Replacement = 'bg-[var(--admin-bg-primary)]' },
    @{ Pattern = 'bg-[#f8fafc] dark:bg-[#020617]'; Replacement = 'bg-[var(--admin-bg-primary)]' },
    
    # Border colors
    @{ Pattern = 'border-slate-200 dark:border-slate-600'; Replacement = 'border-[var(--border-main)]' },
    @{ Pattern = 'border-slate-100 dark:border-slate-600'; Replacement = 'border-[var(--border-subtle)]' },
    @{ Pattern = 'border-slate-200 dark:border-slate-700'; Replacement = 'border-[var(--border-main)]' },
    
    # Text colors
    @{ Pattern = 'text-slate-900 dark:text-white'; Replacement = 'text-[var(--admin-text-primary)]' },
    @{ Pattern = 'text-slate-800 dark:text-white'; Replacement = 'text-[var(--admin-text-primary)]' },
    @{ Pattern = 'text-slate-600 dark:text-slate-400'; Replacement = 'text-[var(--admin-text-secondary)]' },
    @{ Pattern = 'text-slate-500 dark:text-slate-400'; Replacement = 'text-[var(--admin-text-secondary)]' },
    @{ Pattern = 'text-slate-500 dark:text-slate-300'; Replacement = 'text-[var(--admin-text-secondary)]' },
    
    # Hover states
    @{ Pattern = 'hover:bg-slate-50 dark:hover:bg-slate-800'; Replacement = 'hover:bg-[var(--admin-bg-primary)]' },
    @{ Pattern = 'hover:bg-slate-100 dark:hover:bg-slate-800'; Replacement = 'hover:bg-[var(--admin-bg-primary)]' },
    @{ Pattern = 'hover:bg-slate-50 dark:hover:bg-slate-700'; Replacement = 'hover:bg-[var(--admin-bg-primary)]' }
)

function Update-FileContent {
    param (
        [string]$FilePath
    )
    
    $content = Get-Content $FilePath -Raw
    $originalContent = $content
    
    foreach ($replacement in $replacements) {
        $content = $content -replace [regex]::Escape($replacement.Pattern), $replacement.Replacement
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $FilePath -Value $content -NoNewline
        Write-Host "Updated: $FilePath" -ForegroundColor Green
        return $true
    }
    
    return $false
}

# Process admin pages
Write-Host "Updating Admin Pages for Dark Mode..." -ForegroundColor Cyan

$updatedCount = 0
$adminFiles = Get-ChildItem -Path $adminPagesPath -Filter "*.jsx" -Recurse -ErrorAction SilentlyContinue

foreach ($file in $adminFiles) {
    if (Update-FileContent -FilePath $file.FullName) {
        $updatedCount++
    }
}

# Process admin components
$componentFiles = Get-ChildItem -Path $adminComponentsPath -Filter "*.jsx" -Recurse -ErrorAction SilentlyContinue

foreach ($file in $componentFiles) {
    if (Update-FileContent -FilePath $file.FullName) {
        $updatedCount++
    }
}

Write-Host "Dark Mode Update Complete!" -ForegroundColor Green
Write-Host "Files Updated: $updatedCount" -ForegroundColor Yellow
