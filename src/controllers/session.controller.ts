import { Request, Response, NextFunction } from 'express';
import { WppClient } from '../wpp/wpp.client';
import { handleIncomingMessage } from '../wpp/wpp.handler';
import { logger } from '../utils/logger';

export class SessionController {
  private wppClient = WppClient.getInstance();

  public getStatus = (req: Request, res: Response): void => {
    res.json({
      success: true,
      data: {
        status: this.wppClient.getStatus(),
        connected: this.wppClient.isConnected(),
      },
    });
  };

  public getQrCode = (req: Request, res: Response): void => {
    const { base64, url } = this.wppClient.getQrCode();
    
    if (this.wppClient.getStatus() !== 'QR_READY') {
      res.status(400).json({
        success: false,
        message: `QR Code is not available. Current status is ${this.wppClient.getStatus()}`,
      });
      return;
    }

    res.json({
      success: true,
      data: {
        base64,
        url,
      },
    });
  };

  public initializeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (this.wppClient.isConnected()) {
        res.json({
          success: true,
          message: 'WhatsApp session is already connected',
        });
        return;
      }

      // Initialize session asynchronously
      this.wppClient.initialize(handleIncomingMessage).catch((err) => {
        logger.error('Async initialization error for WppClient:', err);
      });

      res.json({
        success: true,
        message: 'WhatsApp session initialization triggered successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public disconnectSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.wppClient.disconnect();
      res.json({
        success: true,
        message: 'WhatsApp session disconnected and logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getQrView = (req: Request, res: Response): void => {
    // Serve a premium, responsive glassmorphic HTML page to scan the QR code
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SocialBuzzz18 WhatsApp Session Link</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #0b0f19;
      --card-bg: rgba(255, 255, 255, 0.03);
      --card-border: rgba(255, 255, 255, 0.08);
      --primary-color: #25d366; /* WhatsApp Green */
      --accent-color: #6366f1; /* Premium Violet */
      --text-color: #ffffff;
      --text-secondary: #94a3b8;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Outfit', sans-serif;
      background: radial-gradient(circle at 50% 50%, #1e1b4b 0%, var(--bg-color) 70%);
      color: var(--text-color);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow-x: hidden;
    }

    .container {
      max-width: 500px;
      width: 100%;
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 40px 30px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      text-align: center;
      transition: transform 0.3s ease;
    }

    h1 {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #ffffff 30%, var(--text-secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
      margin-bottom: 30px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 100px;
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 30px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: all 0.3s ease;
    }

    .status-connected {
      background: rgba(37, 211, 102, 0.1);
      color: var(--primary-color);
      border: 1px solid rgba(37, 211, 102, 0.2);
    }

    .status-initializing {
      background: rgba(99, 102, 241, 0.1);
      color: var(--accent-color);
      border: 1px solid rgba(99, 102, 241, 0.2);
    }

    .status-qr {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .status-disconnected {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: currentColor;
    }

    .status-connected .status-dot {
      animation: pulse 1.5s infinite;
    }

    .qr-container {
      width: 250px;
      height: 250px;
      margin: 0 auto 30px;
      background: rgba(255, 255, 255, 0.02);
      border: 2px dashed rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .qr-img {
      width: 90%;
      height: 90%;
      object-fit: contain;
      border-radius: 12px;
      background: #ffffff;
      padding: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }

    .loading-spinner {
      border: 4px solid rgba(255, 255, 255, 0.1);
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border-left-color: var(--accent-color);
      animation: spin 1s linear infinite;
    }

    .btn {
      display: inline-block;
      width: 100%;
      padding: 14px;
      border-radius: 14px;
      font-family: inherit;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      background: linear-gradient(135deg, var(--accent-color) 0%, #4f46e5 100%);
      color: #ffffff;
      box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 25px -5px rgba(99, 102, 241, 0.6);
    }

    .btn:active {
      transform: translateY(0);
    }

    .instructions {
      text-align: left;
      margin-top: 30px;
      background: rgba(255, 255, 255, 0.01);
      border-radius: 16px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.02);
    }

    .instructions p {
      font-size: 0.95rem;
      margin-bottom: 12px;
      color: var(--text-secondary);
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .instructions p:last-child {
      margin-bottom: 0;
    }

    .step-num {
      background: rgba(255, 255, 255, 0.1);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 600;
      color: #ffffff;
      flex-shrink: 0;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0% { transform: scale(0.9); opacity: 0.6; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(0.9); opacity: 0.6; }
    }
  </style>
</head>
<body>

  <div class="container">
    <h1>SocialBuzzz18</h1>
    <div class="subtitle">WhatsApp AI Agent Link Manager</div>

    <div id="statusBadge" class="status-badge status-disconnected">
      <span class="status-dot"></span>
      <span id="statusText">Checking...</span>
    </div>

    <div class="qr-container" id="qrContainer">
      <div class="loading-spinner"></div>
    </div>

    <button id="actionBtn" class="btn" onclick="initializeSession()">Initialize Session</button>

    <div class="instructions">
      <p><span class="step-num">1</span> Open WhatsApp on your business phone.</p>
      <p><span class="step-num">2</span> Tap Menu or Settings and select Linked Devices.</p>
      <p><span class="step-num">3</span> Point your phone to this screen to capture the code.</p>
    </div>
  </div>

  <script>
    let pollInterval;
    
    async function updateStatus() {
      try {
        const response = await fetch('/api/session/status');
        const result = await response.json();
        
        if (result.success) {
          const status = result.data.status;
          const badge = document.getElementById('statusBadge');
          const statusText = document.getElementById('statusText');
          const qrContainer = document.getElementById('qrContainer');
          const actionBtn = document.getElementById('actionBtn');

          // Reset status classes
          badge.className = 'status-badge';

          if (status === 'CONNECTED') {
            badge.classList.add('status-connected');
            statusText.innerText = 'Connected';
            qrContainer.innerHTML = '<div style="color: var(--primary-color); font-size: 4rem; font-weight: bold;">✓</div>';
            actionBtn.innerText = 'Disconnect Bot';
            actionBtn.setAttribute('onclick', 'disconnectSession()');
            actionBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            actionBtn.style.boxShadow = '0 10px 20px -5px rgba(239, 68, 68, 0.4)';
          } else if (status === 'INITIALIZING') {
            badge.classList.add('status-initializing');
            statusText.innerText = 'Initializing';
            qrContainer.innerHTML = '<div class="loading-spinner"></div>';
            actionBtn.innerText = 'Starting...';
            actionBtn.disabled = true;
          } else if (status === 'QR_READY') {
            badge.classList.add('status-qr');
            statusText.innerText = 'Scan QR Code';
            actionBtn.innerText = 'Initializing...';
            actionBtn.disabled = true;
            // Fetch the QR code image
            await fetchQrCode();
          } else {
            badge.classList.add('status-disconnected');
            statusText.innerText = 'Disconnected';
            qrContainer.innerHTML = '<div style="color: var(--text-secondary); font-size: 3rem;">⚠️</div>';
            actionBtn.innerText = 'Initialize Session';
            actionBtn.disabled = false;
            actionBtn.setAttribute('onclick', 'initializeSession()');
            actionBtn.style.background = 'linear-gradient(135deg, var(--accent-color) 0%, #4f46e5 100%)';
            actionBtn.style.boxShadow = '0 10px 20px -5px rgba(99, 102, 241, 0.4)';
          }
        }
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    }

    async function fetchQrCode() {
      try {
        const response = await fetch('/api/session/qr');
        const result = await response.json();
        if (result.success && result.data.base64) {
          const qrContainer = document.getElementById('qrContainer');
          qrContainer.innerHTML = '<img class="qr-img" src="' + result.data.base64 + '" alt="WhatsApp QR Code">';
        }
      } catch (error) {
        console.error('Error fetching QR code:', error);
      }
    }

    async function initializeSession() {
      try {
        document.getElementById('actionBtn').innerText = 'Initializing...';
        document.getElementById('actionBtn').disabled = true;
        
        await fetch('/api/session/init', { method: 'POST' });
        setTimeout(updateStatus, 1000);
      } catch (error) {
        console.error('Error initializing:', error);
      }
    }

    async function disconnectSession() {
      if (confirm('Are you sure you want to disconnect the WhatsApp session?')) {
        try {
          await fetch('/api/session/disconnect', { method: 'POST' });
          setTimeout(updateStatus, 1000);
        } catch (error) {
          console.error('Error disconnecting:', error);
        }
      }
    }

    // Start polling status
    updateStatus();
    pollInterval = setInterval(updateStatus, 3000);
  </script>
</body>
</html>
    `;

    res.send(htmlContent);
  };

  public getAdminView = (req: Request, res: Response): void => {
    const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SocialBuzzz18 - Admin Portal</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-slate-900: #0f172a;
      --bg-slate-800: #1e293b;
      --bg-slate-700: #334155;
      --border-slate-700: #334155;
      --text-slate-50: #f8fafc;
      --text-slate-400: #94a3b8;
      --accent-blue: #3b82f6;
      --accent-green: #22c55e;
      --accent-red: #ef4444;
      --accent-orange: #f59e0b;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Outfit', sans-serif;
      background-color: var(--bg-slate-900);
      color: var(--text-slate-50);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Header Bar */
    header {
      background-color: var(--bg-slate-800);
      border-bottom: 1px solid var(--border-slate-700);
      padding: 15px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-title {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .brand-title span {
      color: var(--accent-blue);
    }

    .status-panel {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .badge-connected {
      background: rgba(34, 197, 94, 0.1);
      color: var(--accent-green);
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .badge-initializing {
      background: rgba(59, 130, 246, 0.1);
      color: var(--accent-blue);
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .badge-disconnected {
      background: rgba(239, 68, 68, 0.1);
      color: var(--accent-red);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: currentColor;
    }

    /* Main Container */
    .dashboard-layout {
      flex: 1;
      display: flex;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      padding: 25px;
      gap: 25px;
    }

    /* Sidebar Navigation */
    .nav-sidebar {
      width: 260px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .nav-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      background: transparent;
      border: none;
      color: var(--text-slate-400);
      padding: 14px 20px;
      text-align: left;
      border-radius: 12px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .nav-btn:hover {
      background: var(--bg-slate-800);
      color: var(--text-slate-50);
    }

    .nav-btn.active {
      background: var(--accent-blue);
      color: var(--text-slate-50);
    }

    /* Content Area */
    .content-card {
      flex: 1;
      background-color: var(--bg-slate-800);
      border: 1px solid var(--border-slate-700);
      border-radius: 20px;
      padding: 30px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      max-height: 80vh;
    }

    .tab-content {
      display: none;
      height: 100%;
    }

    .tab-content.active {
      display: flex;
      flex-direction: column;
    }

    h2 {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 20px;
    }

    /* Table CSS */
    .table-container {
      overflow-x: auto;
      margin-top: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    th {
      color: var(--text-slate-400);
      font-weight: 600;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-slate-700);
      font-size: 0.9rem;
    }

    td {
      padding: 16px;
      border-bottom: 1px solid var(--border-slate-700);
      vertical-align: middle;
      font-size: 0.95rem;
    }

    tr:hover td {
      background: rgba(255, 255, 255, 0.01);
    }

    .lead-status-select {
      background-color: var(--bg-slate-900);
      color: var(--text-slate-50);
      border: 1px solid var(--border-slate-700);
      padding: 6px 10px;
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.85rem;
      cursor: pointer;
    }

    /* Chat layout styling */
    .chat-container {
      display: flex;
      height: 65vh;
      border: 1px solid var(--border-slate-700);
      border-radius: 12px;
      overflow: hidden;
    }

    .chat-sidebar {
      width: 300px;
      background: var(--bg-slate-900);
      border-right: 1px solid var(--border-slate-700);
      display: flex;
      flex-direction: column;
    }

    .chat-list-header {
      padding: 15px;
      border-bottom: 1px solid var(--border-slate-700);
      font-weight: 700;
      font-size: 1rem;
    }

    .chat-items-list {
      flex: 1;
      overflow-y: auto;
    }

    .chat-item {
      padding: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.02);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .chat-item:hover {
      background: var(--bg-slate-800);
    }

    .chat-item.active {
      background: rgba(59, 130, 246, 0.1);
      border-left: 3px solid var(--accent-blue);
    }

    .chat-item-name {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .chat-item-id {
      font-size: 0.8rem;
      color: var(--text-slate-400);
    }

    .chat-window {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--bg-slate-800);
    }

    .chat-header {
      padding: 15px 20px;
      background: var(--bg-slate-900);
      border-bottom: 1px solid var(--border-slate-700);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .msg-bubble {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 12px;
      line-height: 1.4;
      font-size: 0.95rem;
    }

    .msg-user {
      align-self: flex-start;
      background-color: var(--bg-slate-700);
      color: var(--text-slate-50);
      border-top-left-radius: 0;
    }

    .msg-assistant {
      align-self: flex-end;
      background-color: var(--accent-blue);
      color: #ffffff;
      border-top-right-radius: 0;
    }

    .msg-meta {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
      margin-top: 5px;
      text-align: right;
    }

    .chat-input-area {
      padding: 15px 20px;
      background: var(--bg-slate-900);
      border-top: 1px solid var(--border-slate-700);
      display: flex;
      gap: 10px;
    }

    .chat-input {
      flex: 1;
      background: var(--bg-slate-800);
      border: 1px solid var(--border-slate-700);
      padding: 12px;
      border-radius: 8px;
      color: var(--text-slate-50);
      font-family: inherit;
      font-size: 0.95rem;
    }

    .chat-input:focus {
      outline: none;
      border-color: var(--accent-blue);
    }

    .send-btn {
      background: var(--accent-blue);
      color: #ffffff;
      border: none;
      padding: 0 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .send-btn:hover {
      opacity: 0.9;
    }

    /* Device Pairing Card inside Dashboard */
    .sync-card {
      text-align: center;
      max-width: 400px;
      margin: 40px auto;
      padding: 20px;
    }

    .qr-box {
      width: 250px;
      height: 250px;
      background: rgba(255, 255, 255, 0.02);
      border: 2px dashed var(--border-slate-700);
      border-radius: 12px;
      margin: 20px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .qr-box img {
      width: 90%;
      height: 90%;
      background: white;
      padding: 10px;
      border-radius: 6px;
    }

    .dashboard-btn {
      background: var(--accent-blue);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.95rem;
    }

    .dashboard-btn:hover {
      opacity: 0.9;
    }

    .dashboard-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .dashboard-btn-red {
      background: var(--accent-red);
    }

    .empty-state {
      text-align: center;
      color: var(--text-slate-400);
      padding: 40px;
      font-size: 1.1rem;
    }
  </style>
</head>
<body>

  <header>
    <div class="brand-title">SocialBuzzz18 <span>Admin</span></div>
    <div class="status-panel">
      <div id="badge" class="header-badge badge-disconnected">
        <span class="badge-dot"></span>
        <span id="badgeText">Disconnected</span>
      </div>
    </div>
  </header>

  <div class="dashboard-layout">
    <div class="nav-sidebar">
      <button id="btnLeads" class="nav-btn active" onclick="switchTab('leads')">
        Leads Pipeline
      </button>
      <button id="btnChats" class="nav-btn" onclick="switchTab('chats')">
        Live Chat Console
      </button>
      <button id="btnSync" class="nav-btn" onclick="switchTab('sync')">
        Link Account
      </button>
    </div>

    <div class="content-card">
      
      <!-- Leads Tab -->
      <div id="tabLeads" class="tab-content active">
        <h2>Leads Pipeline</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Extracted At</th>
                <th>Name</th>
                <th>Business Name</th>
                <th>Phone Number</th>
                <th>Requirements</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="leadsTableBody">
              <tr>
                <td colspan="6" class="empty-state">Loading leads data...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Chats Tab -->
      <div id="tabChats" class="tab-content">
        <h2>Live Chat Console</h2>
        <div class="chat-container">
          <div class="chat-sidebar">
            <div class="chat-list-header">Conversations</div>
            <div class="chat-items-list" id="chatItemsList">
              <div class="empty-state">No conversations found</div>
            </div>
          </div>
          <div class="chat-window">
            <div class="chat-header">
              <div id="chatHeaderName" style="font-weight: 700; font-size: 1.1rem;">Select a Chat</div>
              <div id="chatHeaderId" style="font-size: 0.85rem; color: var(--text-slate-400);"></div>
            </div>
            <div class="chat-messages" id="chatMessages">
              <div class="empty-state">Select a chat from the sidebar to view history and manually reply.</div>
            </div>
            <div class="chat-input-area">
              <input type="text" id="chatInput" class="chat-input" placeholder="Type a message to reply..." onkeydown="if(event.key==='Enter') sendManualMessage()">
              <button class="send-btn" onclick="sendManualMessage()">Send</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Sync Tab -->
      <div id="tabSync" class="tab-content">
        <h2>WhatsApp Link Manager</h2>
        <div class="sync-card">
          <div id="syncStatusBadge" class="header-badge badge-disconnected" style="margin-bottom: 20px;">
            <span class="badge-dot"></span>
            <span id="syncStatusText">Disconnected</span>
          </div>
          <div class="qr-box" id="qrBox">
            <div style="font-size: 3rem;">⚠️</div>
          </div>
          <button id="syncActionBtn" class="dashboard-btn" onclick="toggleSync()">Initialize Session</button>
        </div>
      </div>

    </div>
  </div>

  <script>
    let currentTab = 'leads';
    let statusPollInterval;
    let leadsPollInterval;
    let chatsPollInterval;
    let activeChatPhone = null;
    let messagePollInterval = null;

    function switchTab(tabName) {
      currentTab = tabName;
      
      // Update sidebar nav states
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById('btn' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');

      // Update content tabs display
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');

      if (tabName === 'leads') {
        loadLeads();
      } else if (tabName === 'chats') {
        loadChats();
      }
    }

    async function loadStatus() {
      try {
        const response = await fetch('/api/session/status');
        const result = await response.json();
        if (result.success) {
          const status = result.data.status;
          const badge = document.getElementById('badge');
          const badgeText = document.getElementById('badgeText');
          
          const syncBadge = document.getElementById('syncStatusBadge');
          const syncText = document.getElementById('syncStatusText');
          const syncBtn = document.getElementById('syncActionBtn');
          const qrBox = document.getElementById('qrBox');

          // Reset badge classes
          badge.className = 'header-badge';
          syncBadge.className = 'header-badge';

          if (status === 'CONNECTED') {
            badge.classList.add('badge-connected');
            badgeText.innerText = 'Connected';
            syncBadge.classList.add('badge-connected');
            syncText.innerText = 'Connected';
            syncBtn.innerText = 'Disconnect Session';
            syncBtn.className = 'dashboard-btn dashboard-btn-red';
            syncBtn.disabled = false;
            syncBtn.setAttribute('onclick', 'toggleSync("disconnect")');
            qrBox.innerHTML = '<div style="color: var(--accent-green); font-size: 4rem;">✓</div>';
          } else if (status === 'INITIALIZING') {
            badge.classList.add('badge-initializing');
            badgeText.innerText = 'Initializing';
            syncBadge.classList.add('badge-initializing');
            syncText.innerText = 'Initializing';
            syncBtn.innerText = 'Starting...';
            syncBtn.disabled = true;
            qrBox.innerHTML = '<div style="border: 3px solid rgba(255,255,255,0.1); border-left-color: var(--accent-blue); width: 40px; height: 40px; border-radius:50%; animation: spin 1s infinite linear;"></div>';
          } else if (status === 'QR_READY') {
            badge.classList.add('badge-initializing');
            badgeText.innerText = 'Pairing Required';
            syncBadge.classList.add('badge-initializing');
            syncText.innerText = 'Scan QR Code';
            syncBtn.innerText = 'Initializing...';
            syncBtn.disabled = true;
            fetchQrCode();
          } else {
            badge.classList.add('badge-disconnected');
            badgeText.innerText = 'Disconnected';
            syncBadge.classList.add('badge-disconnected');
            syncText.innerText = 'Disconnected';
            syncBtn.innerText = 'Initialize Session';
            syncBtn.className = 'dashboard-btn';
            syncBtn.disabled = false;
            syncBtn.setAttribute('onclick', 'toggleSync("init")');
            qrBox.innerHTML = '<div style="font-size: 3rem;">⚠️</div>';
          }
        }
      } catch (err) {
        console.error('Error fetching status:', err);
      }
    }

    async function fetchQrCode() {
      try {
        const response = await fetch('/api/session/qr');
        const result = await response.json();
        if (result.success && result.data.base64) {
          document.getElementById('qrBox').innerHTML = '<img src="' + result.data.base64 + '" alt="WhatsApp QR Code">';
        }
      } catch (err) {
        console.error('Error getting QR code:', err);
      }
    }

    async function toggleSync(action) {
      try {
        const btn = document.getElementById('syncActionBtn');
        btn.disabled = true;
        
        if (action === 'disconnect') {
          if (confirm('Disconnect WhatsApp? This will log the bot out.')) {
            await fetch('/api/session/disconnect', { method: 'POST' });
          }
        } else {
          await fetch('/api/session/init', { method: 'POST' });
        }
        setTimeout(loadStatus, 1000);
      } catch (err) {
        console.error(err);
      }
    }

    async function loadLeads() {
      try {
        const response = await fetch('/api/leads');
        const result = await response.json();
        if (result.success) {
          const body = document.getElementById('leadsTableBody');
          if (result.data.length === 0) {
            body.innerHTML = '<tr><td colspan="6" class="empty-state">No leads captured yet. Send a WhatsApp message to capture.</td></tr>';
            return;
          }

          let html = '';
          result.data.forEach(lead => {
            const date = new Date(lead.extractedAt).toLocaleString();
            html += '<tr>';
            html += '<td>' + date + '</td>';
            html += '<td style="font-weight: 600;">' + (lead.name || 'Anonymous') + '</td>';
            html += '<td>' + (lead.business || 'N/A') + '</td>';
            html += '<td>' + lead.phone + '</td>';
            html += '<td>' + (lead.requirements || '') + '</td>';
            html += '<td>';
            html += '<select class="lead-status-select" onchange="changeLeadStatus(&apos;' + lead._id + '&apos;, this.value)">';
            html += '<option value="new"' + (lead.status === 'new' ? ' selected' : '') + '>New</option>';
            html += '<option value="contacted"' + (lead.status === 'contacted' ? ' selected' : '') + '>Contacted</option>';
            html += '<option value="qualified"' + (lead.status === 'qualified' ? ' selected' : '') + '>Qualified</option>';
            html += '<option value="lost"' + (lead.status === 'lost' ? ' selected' : '') + '>Lost</option>';
            html += '</select>';
            html += '</td>';
            html += '</tr>';
          });
          body.innerHTML = html;
        }
      } catch (err) {
        console.error('Error loading leads:', err);
      }
    }

    async function changeLeadStatus(leadId, newStatus) {
      try {
        await fetch('/api/leads/' + leadId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        loadLeads();
      } catch (err) {
        console.error(err);
      }
    }

    async function loadChats() {
      try {
        const response = await fetch('/api/chats');
        const result = await response.json();
        if (result.success) {
          const list = document.getElementById('chatItemsList');
          if (result.data.length === 0) {
            list.innerHTML = '<div class="empty-state">No active chats</div>';
            return;
          }

          let html = '';
          result.data.forEach(chat => {
            const isActive = activeChatPhone === chat.chatId ? ' active' : '';
            html += '<div class="chat-item' + isActive + '" onclick="openChat(&apos;' + chat.chatId + '&apos;, &apos;' + (chat.contactName || '') + '&apos;)">';
            html += '<div class="chat-item-name">' + (chat.contactName || 'Client') + '</div>';
            html += '<div class="chat-item-id">' + chat.chatId.split('@')[0] + '</div>';
            html += '</div>';
          });
          list.innerHTML = html;
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function openChat(chatId, contactName) {
      activeChatPhone = chatId;
      document.getElementById('chatHeaderName').innerText = contactName || 'Client';
      document.getElementById('chatHeaderId').innerText = chatId.split('@')[0];
      
      // Update active selected list item
      document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
        if (item.querySelector('.chat-item-id').innerText === chatId.split('@')[0]) {
          item.classList.add('active');
        }
      });

      loadMessages();
      
      // Setup message polling
      if (messagePollInterval) clearInterval(messagePollInterval);
      messagePollInterval = setInterval(loadMessages, 3000);
    }

    async function loadMessages() {
      if (!activeChatPhone) return;
      try {
        const response = await fetch('/api/chats/' + encodeURIComponent(activeChatPhone));
        const result = await response.json();
        if (result.success) {
          const messagesBox = document.getElementById('chatMessages');
          
          if (result.data.length === 0) {
            messagesBox.innerHTML = '<div class="empty-state">No messages inside chat</div>';
            return;
          }

          let html = '';
          result.data.forEach(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const bubbleClass = msg.role === 'user' ? 'msg-user' : 'msg-assistant';
            html += '<div class="msg-bubble ' + bubbleClass + '">';
            html += '<div>' + escapeHtml(msg.body) + '</div>';
            html += '<div class="msg-meta">' + time + '</div>';
            html += '</div>';
          });
          messagesBox.innerHTML = html;
          // Scroll to bottom
          messagesBox.scrollTop = messagesBox.scrollHeight;
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function sendManualMessage() {
      const input = document.getElementById('chatInput');
      const text = input.value.trim();
      if (!text || !activeChatPhone) return;

      try {
        input.value = '';
        
        const response = await fetch('/api/chats/' + encodeURIComponent(activeChatPhone) + '/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageType: 'text',
            message: text
          })
        });
        
        const result = await response.json();
        if (result.success) {
          loadMessages();
        } else {
          alert('Failed to send message: ' + result.message);
        }
      } catch (err) {
        console.error(err);
      }
    }

    function escapeHtml(text) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    // Initialize Polling
    loadStatus();
    loadLeads();
    
    statusPollInterval = setInterval(loadStatus, 3000);
    leadsPollInterval = setInterval(() => {
      if (currentTab === 'leads') loadLeads();
    }, 5000);
    chatsPollInterval = setInterval(() => {
      if (currentTab === 'chats') loadChats();
    }, 5000);
  </script>
</body>
</html>
    `;
    res.send(adminHtml);
  };
}

