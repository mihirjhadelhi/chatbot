# Installing Node.js on Windows

## 🚀 Quick Installation Guide

### Step 1: Download Node.js

1. **Visit the official Node.js website:**
   - Go to: **https://nodejs.org/**

2. **Download the LTS version:**
   - Click on the **LTS (Long Term Support)** version button
   - This will download the Windows installer (.msi file)
   - The LTS version is recommended for stability

### Step 2: Install Node.js

1. **Run the installer:**
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard

2. **Important: During installation:**
   - ✅ **Check the box** that says "Automatically install the necessary tools"
   - ✅ **Make sure** the option to add Node.js to PATH is selected (this is usually checked by default)
   - Click "Next" through the wizard
   - Click "Install" to begin installation
   - You may need administrator privileges

3. **Complete the installation:**
   - Wait for the installation to finish
   - Click "Finish" when done

### Step 3: Verify Installation

1. **Close and reopen your terminal/PowerShell** (important!)

2. **Check Node.js version:**
   ```bash
   node -v
   ```
   You should see something like: `v20.x.x` or `v18.x.x`

3. **Check npm version:**
   ```bash
   npm -v
   ```
   You should see something like: `10.x.x` or `9.x.x`

### Step 4: Install Frontend Dependencies

Once Node.js is installed, you can install the React frontend dependencies:

```bash
cd frontend
npm install
```

## ✅ Installation Complete!

After installation, you'll be able to:
- Run `npm install` to install dependencies
- Run `npm run dev` to start the development server
- Use all npm commands

## 🐛 Troubleshooting

### If npm is still not recognized after installation:

1. **Restart your computer** (sometimes required for PATH changes)

2. **Or manually add Node.js to PATH:**
   - Press `Win + X` and select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add: `C:\Program Files\nodejs\`
   - Click "OK" on all dialogs
   - **Close and reopen** your terminal

3. **Verify Node.js installation path:**
   - Default location: `C:\Program Files\nodejs\`
   - Check if `node.exe` exists in that folder

### Alternative: Using Chocolatey (if you have it)

If you have Chocolatey package manager installed:
```bash
choco install nodejs
```

### Alternative: Using Winget (Windows 10/11)

```bash
winget install OpenJS.NodeJS.LTS
```

## 📝 Notes

- Node.js includes npm automatically
- The LTS version is recommended for production use
- You may need to restart your terminal after installation
- Make sure you have internet connection during installation

## 🔗 Useful Links

- **Node.js Official Website:** https://nodejs.org/
- **Node.js Documentation:** https://nodejs.org/docs/
- **npm Documentation:** https://docs.npmjs.com/


