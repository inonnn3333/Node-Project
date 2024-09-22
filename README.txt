## Project Description:
Server-side development for a web application that includes a site management system allowing business users to publish, edit, and delete content.

## Key Features:
- User registration and login.
- Creation, updating, and deletion of cards.
- Role-based permission management (regular user, business user, and admin).
- Saving cards and adding likes.
- JWT-based user authentication system.

## Technologies:
- Node.js
- Express
- MongoDB
- mongoose
- Cors
- Joi for data validation
- JWT for user authentication
- bcrypt for password encryption
- Chalk for styled logs
- Moment for date and time
- Morgan for log management

## API:
### Users:
- **POST** `/users` - Register a new user
- **POST** `/users/login` - User login
- **GET** `/users` - Get all users (admin only)
- **GET** `/users/:id` - Get specific user details (for the user themselves or an admin)
- **PUT** `/users/:id` - Update user details (for the user themselves)
- **DELETE** `/users/:id` - Delete a user (for the user themselves or an admin)

### Cards:
- **POST** `/cards` - Create a new card (for business users only)
- **GET** `/cards` - Get all cards
- **GET** `/cards/my-cards` - Get the logged-in user's cards
- **GET** `/cards/:id` - Get a specific card
- **PUT** `/cards/:id` - Update a card (for the user who created the card)
- **PATCH** `/cards/:id` - Add/remove a like on a card
- **DELETE** `/cards/:id` - Delete a card (for the user who created the card or an admin)

## Error Handling:
In case a page is not found, the user will be redirected to a custom 404 page.
