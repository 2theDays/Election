const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3001;

app.use(express.json());

app.post('/api/run-orchestrator', (req, res) => {
    console.log('Starting Main Orchestrator...');
    // 파이썬 경로 및 환경 변수 설정 (필요 시 수정)
    const pythonPath = 'C:\\Python314\\python.exe';
    const command = `$env:PYTHONIOENCODING="utf-8"; ${pythonPath} main_orchestrator.py`;

    exec(command, { shell: 'powershell.exe', cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ success: false, error: error.message });
        }
        console.log(`Stdout: ${stdout}`);
        res.json({ success: true, output: stdout });
    });
});

app.listen(port, () => {
    console.log(`Strategy Proxy Server running at http://localhost:${port}`);
});
