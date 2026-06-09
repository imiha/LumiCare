# GitHub Workflow Skill — Clinique Lumière

How to interact with GitHub on this machine. Load when pushing branches or opening PRs.

---

## Key Facts

- **gh CLI is NOT installed** — all GitHub API calls must go through `Invoke-RestMethod` in PowerShell
- **GitHub user:** `imiha`
- **Repo:** `imiha/LumiCare`
- **Token location:** Windows Credential Manager, target `git:https://github.com` (40-char `ghp_` token)
- **Required token scopes:** `repo` (for pushes/PRs) + `project` (for GitHub Projects v2 board management). If a Projects API call returns `INSUFFICIENT_SCOPES`, the token needs the `project` scope added at https://github.com/settings/tokens
- **The `Add-Type` block must be re-declared in every new PowerShell session** — C# types do not persist between tool calls

---

## Step 1 — Token retrieval (always run first)

Paste this block in full before any API call. The class name must be unique per session — increment the suffix if a session reuses it (e.g. `CredMan4`, `CredMan5`).

```powershell
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using System.Text;

public class CredManN {
    [DllImport("advapi32.dll", EntryPoint="CredReadW", CharSet=CharSet.Unicode, SetLastError=true)]
    static extern bool CredRead(string target, uint type, uint flags, out IntPtr credential);
    [DllImport("advapi32.dll")] static extern void CredFree(IntPtr credential);
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
    struct CREDENTIAL { public uint flags, type; public string targetName, comment; public System.Runtime.InteropServices.ComTypes.FILETIME lastWritten; public uint credentialBlobSize; public IntPtr credentialBlob; public uint persist; public uint attributeCount; public IntPtr attributes; public string targetAlias, userName; }
    public static string GetToken(string target) {
        IntPtr ptr;
        if (!CredRead(target, 1, 0, out ptr)) return null;
        var cred = Marshal.PtrToStructure<CREDENTIAL>(ptr);
        var bytes = new byte[cred.credentialBlobSize];
        Marshal.Copy(cred.credentialBlob, bytes, 0, bytes.Length);
        CredFree(ptr);
        return Encoding.Unicode.GetString(bytes);
    }
}
'@

$token = [CredManN]::GetToken("git:https://github.com")
```

Replace `CredManN` with a name not already declared in this session (`CredMan3`, `CredMan4`, etc.).

---

## Step 2 — Push branch

```powershell
git push -u origin <branch-name>
```

Or via Bash tool:
```bash
git push -u origin <branch-name>
```

---

## Step 3 — Open a PR

```powershell
$body = @{
    title = "Short title (under 70 chars)"
    head  = "story/<id>-short-description"
    base  = "main"
    body  = @"
## Summary

- bullet 1
- bullet 2
- bullet 3

## Test plan

- [ ] step 1
- [ ] step 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)
"@
} | ConvertTo-Json

$headers = @{ Authorization = "token $token"; Accept = "application/vnd.github.v3+json" }
$result = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/imiha/LumiCare/pulls" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"

Write-Output $result.html_url
```

---

## Error: PR already exists (422)

If the API returns `"A pull request already exists for imiha:<branch>"`, a PR is already open for this branch. New commits pushed to the branch automatically appear in the existing PR — no action needed.

---

## Other useful API calls

### List open PRs
```powershell
$headers = @{ Authorization = "token $token"; Accept = "application/vnd.github.v3+json" }
Invoke-RestMethod -Uri "https://api.github.com/repos/imiha/LumiCare/pulls?state=open" -Headers $headers |
    Select-Object number, title, @{n='url';e={$_.html_url}}
```

### Get a specific PR
```powershell
Invoke-RestMethod -Uri "https://api.github.com/repos/imiha/LumiCare/pulls/<number>" -Headers $headers |
    Select-Object number, title, state, @{n='url';e={$_.html_url}}
```

### Update PR title or body
```powershell
$patch = @{ title = "New title"; body = "New body" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.github.com/repos/imiha/LumiCare/pulls/<number>" `
    -Method PATCH -Headers $headers -Body $patch -ContentType "application/json"
```

---

## Branch naming

Per CLAUDE.md: `story/<id>-short-description`
- `story/1.1.1-registration-form`
- `story/epic-2-appointments`

`main` is the base branch for all PRs.
