---
title: "Media Tree"
type: "technical"
year: 2025
summary: "Interactive media organization platform with hierarchical tree structure"
stack: ["React", "Node.js", "Flask"]
role: "Full Stack Developer"
tags: ["react", "nodejs", "flask", "web-development", "python", "javascript"]
cover: "/images/projects/technical/MediaTree/cover.png"
coverAlt: "Media Tree application interface"
gallery:
  - src: "/images/projects/technical/MediaTree/media2.png"
    alt: "Media Tree main dashboard"
  - src: "/images/projects/technical/MediaTree/media3.png"
    alt: "Media Tree file organization view"
  - src: "/images/projects/technical/MediaTree/media4.png"
    alt: "Media Tree hierarchical structure"
  - src: "/images/projects/technical/MediaTree/media5.png"
    alt: "Media Tree content management"
  - src: "/images/projects/technical/MediaTree/media1.png"
    alt: "Media Tree additional view"
draft: false
order: 50
---

## Overview

Media Tree is a web application for managing and visualizing hierarchical media data from Excel files. Features intelligent caching, file upload capabilities, and an intuitive tree-view interface.

##  Features

###  **Excel File Management**
- **Upload Interface**: Drag & drop or browse to upload Excel files
- **Multiple Formats**: Supports .xlsx and .xls files
- **Real-time Processing**: Watch upload progress in real-time

###  **Intelligent Caching System**
- **Lightning Fast**: First load processes file (5-10s), subsequent loads instant (<1s)
- **Duplicate Detection**: Files identified by content hash, not filename
- **Persistent Cache**: Survives server restarts and deployments
- **Smart Storage**: Processed data cached using Python pickle format

###  **Interactive Tree View**
- **Hierarchical Display**: Navigate complex organizational structures
- **Search & Filter**: Find specific nodes quickly
- **Statistics Dashboard**: View media counts, age distribution, and more
- **Responsive Design**: Works on desktop and mobile devices

###  **Analytics & Insights**
- **Media Statistics**: Count by type, format, and category
- **Age Analysis**: Distribution of content by creation date
- **File Relationships**: Visualize parent-child hierarchies
- **Export Capabilities**: Download processed data

## Technical Implementation

Built with modern web technologies including React for the frontend, Node.js and Python Flask the backend.
