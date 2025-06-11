# SaveItBro Cricket - Live Streaming Platform

A premium, fully functional cricket live streaming website built with HTML, CSS, and JavaScript. Features a secure admin panel for managing streaming channels with user authentication.

## 🚀 Features

### Main Website (`index.html`)
- **Premium Design**: Modern, responsive layout with dark/light theme support
- **Live Streaming**: Display multiple cricket channels with embedded iframes
- **Search & Filter**: Find channels by name or filter by category (Sports, ICC, IPL)
- **Hero Carousel**: Beautiful image carousel with cricket backgrounds
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Modal Streaming**: Full-screen streaming experience
- **Real-time Updates**: Automatically updates when channels are added via admin panel

### Admin Panel (`admin.html`)
- **Secure Authentication**: Username/password login system with session management
- **Dashboard**: Overview of channels, statistics, and recent activity
- **Channel Management**: Add, edit, delete streaming channels
- **Data Management**: Import/export channel data, reset functionality
- **Session Security**: Auto-logout, session monitoring, and expiration warnings

### Authentication System (`login.html`)
- **Secure Login**: Protected admin access with credentials
- **Session Management**: Remember me option with configurable duration
- **Auto-logout**: Sessions expire for security
- **Modern UI**: Beautiful login interface with animations

### 🚀 Features Summary

✅ **Simple and direct streaming experience**
✅ **Responsive design for all devices**
✅ **Dark/light theme support**
✅ **Hero image carousel with cricket backgrounds**
✅ **Advanced search and filtering**
✅ **Secure admin authentication system**
✅ **Real-time channel management**
✅ **Toast notifications for user feedback**
✅ **Mobile-optimized interface**
✅ **Session management with auto-logout**
✅ **Data import/export functionality**

## 🔐 Default Admin Credentials

```
Username: admin
Password: admin123
```

**Important**: Change these credentials in the `login.js` file for production use.

## 📁 File Structure

```
c:\saveitbroCricket\
├── index.html          # Main streaming website
├── admin.html          # Admin panel (requires authentication)
├── login.html          # Admin login page
├── styles.css          # Complete styling for all pages
├── script.js           # Main website functionality
├── admin.js            # Admin panel functionality
├── login.js            # Authentication system
└── README.md           # This file
```

## 🎯 Getting Started

1. **Open the Website**: Simply open `index.html` in your web browser
2. **Browse Channels**: View available cricket streaming channels on the homepage
3. **Watch Streams**: Click "Watch Now" on any channel to start streaming
4. **Admin Access**: Visit `login.html` to access the admin panel
5. **Add Channels**: Use the admin panel to add new streaming channels
6. **Manage Content**: Edit or delete existing channels through the admin interface

### 🚀 Features Summary

✅ **Simple and direct streaming experience**
✅ **Responsive design for all devices**
✅ **Dark/light theme support**
✅ **Hero image carousel with cricket backgrounds**
✅ **Advanced search and filtering**
✅ **Secure admin authentication system**
✅ **Real-time channel management**
✅ **Toast notifications for user feedback**
✅ **Mobile-optimized interface**
✅ **Session management with auto-logout**
✅ **Data import/export functionality**

### 📱 Mobile Optimization

- Responsive design works on all screen sizes
- Touch-friendly interface for mobile devices
- Mobile-specific CSS adjustments

## 🔧 Technical Details

1. **Open the Website**
   - Open `index.html` in your web browser
   - Browse available streaming channels
   - Use search and filters to find specific content

2. **Access Admin Panel**
   - Navigate to `login.html` in your browser
   - Enter credentials: `admin` / `admin123`
   - Manage channels from the admin dashboard

3. **Add New Channels**
   - Login to admin panel
   - Go to "Add Channel" section
   - Fill in the required information:
     - Match Title (e.g., "India vs Australia - Test Match")
     - Channel Name (e.g., "Star Sports 1")
     - Embed Code (iframe code from streaming source)
     - Category (Sports, ICC, IPL, Other)
     - Description (optional)

## 📺 Pre-loaded Channels

The website comes with 3 default streaming channels:

1. **Willow TV** - Live Cricket Coverage
2. **Sky Sports Cricket** - International Matches
3. **Star Sports 1** - Premier Cricket Broadcasting

## 🔧 Configuration

### Changing Admin Credentials

Edit `login.js` and modify the credentials object:

```javascript
this.credentials = {
    username: 'your_username',
    password: 'your_password'
};
```

### Session Duration

Modify session duration in `login.js`:

```javascript
this.sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
this.rememberDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
```

### Adding New Categories

Add categories in both `admin.html` and `index.html` filter sections:

```html
<option value="Your_Category">Your Category</option>
<button class="filter-btn" data-category="Your_Category">Your Category</button>
```

## 🎨 Customization

### Themes
- Built-in dark/light theme toggle
- Theme preference saved in localStorage
- Consistent across all pages

### Colors
Modify CSS variables in `styles.css`:

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    --accent-color: #10b981;
    /* ... more variables */
}
```

### Branding
- Update logo and site name in HTML files
- Modify the gradient backgrounds in CSS
- Change social media links in footer

## 📱 Responsive Design

The website is fully responsive with breakpoints for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (up to 767px)

## 🔒 Security Features

- **Session Management**: Automatic logout after inactivity
- **Authentication**: Required for admin panel access
- **Session Monitoring**: Real-time session validation
- **Secure Storage**: Data stored in localStorage with validation
- **Input Validation**: Form validation for all admin inputs

## 💾 Data Storage

- **Local Storage**: All data stored in browser's localStorage
- **Import/Export**: Backup and restore functionality
- **Cross-page Communication**: Real-time updates between admin and main site

## 🚨 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📝 Usage Examples

### Adding a Channel via Admin Panel

1. Login to admin panel
2. Navigate to "Add Channel"
3. Enter details:
   ```
   Match Title: IPL 2025 - Mumbai vs Chennai
   Channel Name: Hotstar Sports
   Embed Code: <iframe src="...">...</iframe>
   Category: IPL
   Description: Live IPL coverage
   ```
4. Click "Add Channel"
5. Channel appears on main website immediately

### Searching for Channels

- Use the search bar on the main website
- Search works on channel names and match titles
- Results update in real-time as you type

### Filtering by Category

- Click category filter buttons (All, Sports, ICC, IPL)
- Channels filter instantly
- Combine with search for precise results

## 🔄 Data Flow

1. **Admin adds channel** → Data saved to localStorage
2. **Storage event triggered** → Main website receives update
3. **Main website re-renders** → New channel appears immediately
4. **User watches stream** → Modal opens with embedded iframe

## 🛠 Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox/grid
- **Vanilla JavaScript**: No frameworks, pure JS
- **localStorage**: Client-side data persistence
- **FontAwesome**: Icons and visual elements
- **Google Fonts**: Poppins font family

### Key JavaScript Features
- ES6+ Classes and modules
- Event-driven architecture
- Local storage management
- DOM manipulation
- Form validation
- Session management
- Real-time updates

## 🐛 Troubleshooting

### Admin Panel Not Loading
- Check if `login.html` authentication is working
- Verify session data in browser's localStorage
- Clear browser cache and try again

### Channels Not Appearing
- Verify iframe embed codes are valid
- Check browser console for JavaScript errors
- Ensure localStorage is enabled

### Session Issues
- Sessions expire after 24 hours (default)
- Clear localStorage to reset: `localStorage.clear()`
- Check if "Remember me" was selected during login

## 🔮 Future Enhancements

Potential improvements for the platform:

- **User Management**: Multiple admin accounts
- **Analytics**: View statistics and usage data
- **Scheduling**: Schedule streams for specific times
- **Categories**: More granular category management
- **API Integration**: Connect to external streaming APIs
- **CDN Support**: Host assets on CDN for better performance

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify all files are in the correct directory
4. Ensure modern browser compatibility

## 📄 License

This project is open source and available for educational and personal use.

---

**Note**: This platform is designed for educational purposes. Ensure you have proper rights and permissions for any streaming content you embed.
