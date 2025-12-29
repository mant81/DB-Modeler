# Database Modeling Tool

A modern, web-based database modeling tool inspired by dbdiagram.io. Create, visualize, and export database schemas with an intuitive drag-and-drop interface.

🔗 **Live Demo**: [https://v0-database-modeling-tool.vercel.app/](https://v0-database-modeling-tool.vercel.app/)

## Features

### Core Functionality
- **Visual Schema Design**: Create database tables with drag-and-drop interface
- **Relationship Management**: Define foreign key relationships with visual 1:N notation (crow's foot)
- **Column Configuration**: 
  - Add/remove columns
  - Set data types (VARCHAR, INT, TEXT, DATE, TIMESTAMP, etc.)
  - Configure constraints (Primary Key, Foreign Key, NOT NULL, UNIQUE)
  - Add comments to tables and columns

### Export Options
- **SQL Generation**: Auto-generate CREATE TABLE statements with proper constraints
- **JSON Export/Import**: Save and load your schema designs
- **SVG Export**: Export diagrams as scalable vector graphics
- **Local Storage**: Automatic saving to browser storage

### User Experience
- **Dark Theme**: Professional dark interface optimized for extended use
- **Grid Canvas**: Precise alignment with visual grid background
- **Real-time Updates**: Instant SQL preview as you design
- **Responsive Layout**: Three-panel layout (Toolbar, Canvas, Code Panel)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/database-modeling-tool.git
cd database-modeling-tool
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production
```bash
pnpm build
pnpm start
```

## Usage Guide

### Creating Tables
1. Click **"Add Table"** in the toolbar
2. Enter table name in the sidebar
3. Add columns with the **"Add Column"** button
4. Configure each column:
   - Set column name
   - Choose data type
   - Check constraints (PK, FK, NOT NULL, UNIQUE)
   - Add optional comments

### Defining Relationships
1. Check the **FK (Foreign Key)** checkbox on a column
2. Select the referenced table from the dropdown
3. Select the referenced column
4. A visual relationship line will appear on the canvas

### Exporting Your Work
- **Export JSON**: Save your schema design for later
- **Import JSON**: Load a previously saved schema
- **Export SVG**: Download the diagram as an image
- **Copy SQL**: Click "Copy SQL" to copy all CREATE TABLE statements

### Moving Tables
- Click and drag any table on the canvas to reposition it
- Relationship lines automatically update

## Project Structure

```
├── app/
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles and theme variables
├── components/
│   ├── toolbar.tsx        # Top toolbar with actions
│   ├── sidebar.tsx        # Left sidebar for table editing
│   ├── diagram-canvas.tsx # Main canvas with drag-and-drop
│   ├── table-node.tsx     # Individual table component
│   └── code-panel.tsx     # Right panel showing generated SQL
└── public/                # Static assets
```

## Keyboard Shortcuts

- **Drag**: Click and hold to move tables
- **Delete**: Select a table and use the delete button in sidebar

## Roadmap

- [ ] Multiple diagram support
- [ ] Collaborative editing
- [ ] Database connection and reverse engineering
- [ ] More export formats (PNG, PDF)
- [ ] Dark/Light theme toggle
- [ ] Undo/Redo functionality
- [ ] Table duplication
- [ ] Schema versioning

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Inspired by [dbdiagram.io](https://dbdiagram.io/)
- Built with [v0.dev](https://v0.dev/) by Vercel
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

Made with ❤️ using Next.js and v0.dev
