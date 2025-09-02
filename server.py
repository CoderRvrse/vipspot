#!/usr/bin/env python3
"""
Simple HTTP server for testing VIPSpot 2025 locally
Serves static files with proper MIME types and CORS headers
"""

import http.server
import socketserver
import os
import sys
import webbrowser
import threading
import time

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler to serve static files with proper headers"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # Security headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        
        super().end_headers()
    
    def guess_type(self, path):
        # Ensure proper MIME types
        mime_type, encoding = super().guess_type(path)
        
        # Override for specific file types
        if path.endswith('.js'):
            return 'application/javascript', encoding
        elif path.endswith('.css'):
            return 'text/css', encoding
        elif path.endswith('.json'):
            return 'application/json', encoding
        elif path.endswith('.woff2'):
            return 'font/woff2', encoding
        elif path.endswith('.woff'):
            return 'font/woff', encoding
        
        return mime_type, encoding
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        """Custom log format"""
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def open_browser():
    """Open browser after server starts"""
    time.sleep(1)  # Wait for server to start
    webbrowser.open(f'http://localhost:{PORT}')

def main():
    """Start the development server"""
    try:
        # Change to the project directory
        os.chdir(DIRECTORY)
        
        # Create server
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"VIPSpot 2025 Development Server")
            print(f"Serving at: http://localhost:{PORT}")
            print(f"Directory: {DIRECTORY}")
            print(f"Press Ctrl+C to stop the server")
            print("-" * 50)
            
            # Open browser in a separate thread
            browser_thread = threading.Thread(target=open_browser)
            browser_thread.daemon = True
            browser_thread.start()
            
            # Start server
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\nServer stopped by user")
        sys.exit(0)
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"Error: Port {PORT} is already in use")
            print(f"Try using a different port or stop the existing server")
        else:
            print(f"Error starting server: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()