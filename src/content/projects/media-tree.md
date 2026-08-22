---
title: "Media Tree"
type: "technical"
year: 2025
summary: "Turns an Excel export of media records into a searchable, cached tree view"
stack: ["React", "Node.js", "Flask"]
role: "Full Stack Developer"
tags: ["react", "nodejs", "flask", "web-development", "python", "javascript"]
cover: "/images/projects/technical/MediaTree/media4.webp"
coverAlt: "Media Tree application interface"
gallery:
  - src: "/images/projects/technical/MediaTree/media2.webp"
    alt: "Media Tree main dashboard"
  - src: "/images/projects/technical/MediaTree/media3.webp"
    alt: "Media Tree file organization view"
  - src: "/images/projects/technical/MediaTree/media4.webp"
    alt: "Media Tree hierarchical structure"
  - src: "/images/projects/technical/MediaTree/media5.webp"
    alt: "Media Tree content management"
  - src: "/images/projects/technical/MediaTree/media1.webp"
    alt: "Media Tree additional view"
draft: false
order: 50
---

Media Tree takes a spreadsheet of media records and turns it into something you can actually navigate. Upload an Excel file and it renders the hierarchy as a searchable tree, with counts and age breakdowns next to it.

## Features

- **Excel upload**: drag and drop or browse, .xlsx and .xls, with progress shown while the file parses
- **Caching**: the first upload takes 5 to 10 seconds, after that the same file loads in under a second. Files are matched by content hash rather than filename, so renaming one doesn't cost a re-parse
- **Persistent cache**: processed data is pickled to disk, so it survives restarts and deploys
- **Tree view**: search and filter across the hierarchy, and follow parent and child relationships
- **Stats**: counts by type, format and category, plus how content is distributed by creation date
- **Export**: download the processed data

## Stack

React on the front end, Node.js and Python Flask on the back.
