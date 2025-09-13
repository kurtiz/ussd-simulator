# USSD Simulator

A modern, browser-based USSD (Unstructured Supplementary Service Data) simulator built with React, TypeScript, and Tailwind CSS. Test and debug your USSD applications with an intuitive phone dialer interface and comprehensive session management.

## Features

### 🚀 Core Functionality
- **Interactive Phone Dialer**: Authentic keypad interface for dialing USSD codes
- **Real-time Session Management**: Track active sessions with message history
- **HTTP API Integration**: Connect to your USSD gateway endpoints
- **Session Persistence**: Local IndexedDB storage for session history

### 📱 User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Theme Support**: Modern UI with shadcn/ui components
- **Visual Feedback**: Loading states, error handling, and status indicators
- **Intuitive Navigation**: Easy session switching and history browsing

### 🔧 Configuration Options
- **Custom Endpoints**: Configure your USSD gateway URL
- **Session Parameters**: Set phone numbers, network codes, and timeouts
- **Quick Presets**: Switch between development and production environments
- **Auto-generation**: Automatic session ID generation

## Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- Modern web browser with IndexedDB support

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ussd-simulator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` to access the simulator.

## Usage

### Quick Start

1. **Configure Your Endpoint**
   - Enter your USSD gateway URL in the Configuration panel
   - Set your phone number and network parameters
   - Optionally set a custom session ID or let it auto-generate

2. **Start a USSD Session**
   - Use the phone dialer to enter a USSD code (e.g., `*123#`)
   - Click "Dial" or press Enter to send the request
   - View the response in the USSD Display panel

3. **Continue the Session**
   - Enter follow-up responses using the keypad
   - The session remains active until explicitly ended
   - All messages are automatically saved

### Configuration Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| **USSD Endpoint** | Your USSD gateway API URL | `https://api.example.com/ussd` |
| **Session ID** | Unique session identifier | `USSD-12345` (auto-generated if empty) |
| **Phone Number** | Simulated user's phone number | `+1234567890` |
| **Network Code** | Mobile network operator code | `001` |
| **Timeout** | Request timeout in milliseconds | `30000` |

### API Request Format

The simulator sends HTTP POST requests with this JSON payload:

```json
{
  "sessionID": "unique-session-id",
  "userID": "+1234567890",
  "newSession": true,
  "msisdn": "+1234567890",
  "userData": "*123#"
}
```

### Expected API Response Format

Your USSD gateway should respond with:

```json
{
  "response": "Welcome to Service XYZ\n1. Check Balance\n2. Buy Airtime",
  "continueSession": true
}
```

## Development

### Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components (shadcn/ui)
│   ├── USSDSimulator.tsx   # Main simulator component
│   ├── PhoneDialer.tsx     # Interactive keypad interface
│   ├── USSDDisplay.tsx     # Message display component
│   └── ConfigPanel.tsx     # Configuration settings
├── hooks/
│   └── useIndexedDB.ts     # IndexedDB persistence logic
├── App.tsx                 # Root application component
└── main.tsx               # Application entry point
```

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Storage**: IndexedDB with custom hooks
- **Form Handling**: React Hook Form with Zod validation
- **Date Utilities**: date-fns

## Customization

### Styling
The application uses Tailwind CSS for styling. Customize colors and themes by modifying the CSS variables in `src/index.css`.

### UI Components
All UI components are based on shadcn/ui. You can customize component behavior by editing files in `src/components/ui/`.

### API Integration
Modify the request/response handling in `USSDSimulator.tsx` to match your specific USSD gateway requirements.

## Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deployment Options

- **Vercel**: `vercel --prod`
- **Netlify**: Deploy the `dist/` folder
- **GitHub Pages**: Use GitHub Actions with the built files
- **Traditional Web Server**: Serve the `dist/` folder with nginx/Apache

## Troubleshooting

### Common Issues

**Database Warning Messages**
- The app uses IndexedDB for local storage
- If IndexedDB is not available, sessions won't be saved but the app will still function

**CORS Errors**
- Ensure your USSD gateway has proper CORS headers
- For development, consider using a proxy or CORS browser extension

**Connection Timeouts**
- Check your endpoint URL is correct and accessible
- Adjust the timeout setting in the configuration panel

**Session Not Continuing**
- Verify your API returns `"continueSession": true` for ongoing sessions
- Check that your endpoint accepts the expected request format

### Development Tips

- Use the browser's developer tools to inspect network requests
- Enable the "Show History" feature to debug session state
- Test with different network conditions using browser dev tools
- Use the console to view detailed error messages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For issues, questions, or contributions:
- Create an issue in the GitHub repository
- Check existing issues for similar problems
- Provide detailed reproduction steps when reporting bugs

---

**Built with ❤️ for [Kurtiz](https://github.com/kurtiz)**