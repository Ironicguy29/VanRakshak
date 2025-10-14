# VS Code Tasks

- Server: Run dev server (TypeScript via ts-node)
- Simulator: Run Python data generator

## Run via Command Palette
- Tasks: Run Task -> choose desired task

## PowerShell Execution Policy Note
If you see an error about scripts being disabled when running npm:

1. One-time, in an elevated PowerShell (Run as Administrator):

```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

2. Or, use `npx` which does not require script execution policy:

```
cd server
npx npm@latest install
npx npm@latest run dev
```
