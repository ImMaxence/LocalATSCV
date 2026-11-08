# Changelog

All notable changes to LocalATSCV are listed here

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/)

## [1.0.3] - 2026-11-08

### Added

- Navigation menu on phones and tablets: My resumes, Test my resume, Style studio, How it works and Privacy are reachable from every page

## [1.0.2] - 2026-11-08

### Changed

- The changelog is now written entirely in English

## [1.0.1] - 2026-11-08

### Changed

- A resume created from a sample now includes a fictional profile photo (an illustration), which can be replaced or removed like any other photo

## [1.0.0] - 2026-11-08

### Added

- My resumes: bulk delete. Tick several resumes (or select all) and delete them in one go, after confirmation
- Editor: "Custom" mode next to the resume language. The language stays, but no country convention is applied: the photo, date of birth and nationality remain visible on a resume in English
- Editor: an information button explains what the resume language changes, and each section can be collapsed or expanded (the state is remembered on the device)
- Home page: new section about the resume language and the conventions of each country

### Changed

- The editor's "My style" menu is now called "My styles"

### Fixed

- Drag and drop of sections and experiences: the other blocks move aside in real time and a frame shows where the block will land. The spacing between sections is restored

## [0.13.0] - 2026-11-03

### Added

- Style studio: create your own resume design without code, with a panel of blocks to assemble (columns, header, section titles, experiences, skills, languages, photo), shapes to place and drag on the page (circle, blob, square, triangle, ring, waves, stripes, dots), colors and fonts. Each block is drawn as a thumbnail so you can choose at a glance
- Custom CSS: paste your own CSS on the studio canvas or on any template in the gallery ("Customize with CSS" in the My style menu). It applies to that resume only, live, with the list of available classes and a warning when a rule may hinder reading by ATS software (position, transparency, text shadow, text added with CSS)
- Share a style as JSON code: copy, download, then import it from the studio. The code contains the style only, never the resume data
- "My style" menu in the editor to switch between a personal style and a gallery template, and "Use for a resume" button in the studio
- An icon instead of the photo: 15 pictograms (briefcase, chef's hat, stethoscope, rocket…) or your initials, drawn in the accent color. The icon says nothing about you: it stays visible on resumes in English
- Home page: new "Style studio" section, new FAQ question ("Can I create my own resume design?") and a link to the studio in the footer

### Changed

- Full backups also contain the studio styles, and each resume keeps a copy of its style: it stays complete in a backup or an individual export

### Security

- The CSS of a style, even one received from a stranger, is parsed by the browser, then rewritten rule by rule and confined to the resume: it can neither change the rest of the page nor load external resources (imports, fonts and URLs are removed)

## [0.12.0] - 2026-11-02

### Added

- Optional mention of a disability in the profile, with the wording recognized in the resume's country (RQTH in France, categorie protette in Italy, certificado de discapacidad in Spain, Schwerbehinderung in Germany). It appears with the contact details, at the end of the resume or only in the cover letter, with the benefits and limits explained simply, and a targeted version can hide it
- Cover letter: a ready-made sentence about disability, in the language of the resume
- Tailor to a job ad: the editor flags ads that say they welcome people with disabilities
- Display settings from the accessibility button in the header: larger text, a highly legible font (Atkinson Hyperlegible), wider text spacing, higher contrast and reduced animations. They change the interface, never the printed resume
- Read the resume and the letter aloud, with your device's voice
- Step by step mode in the editor: one section at a time, with advice in plain language, all the way to the PDF download
- Years-only dates (layout settings): a short career gap no longer shows
- Medical reasons ("Arrêt maladie", "Sick leave"…) are detected in titles and bullet points, with a neutral title offered in one click ("Career break")
- "Very readable" filter in the gallery: 9 single-column templates, in large type and high contrast
- "Accessibility statement" page, "Accessible to everyone" section on the home page and a new FAQ question

### Changed

- Privacy policy: the disability mention, which is health data, stays on your device like the rest of the resume

## [0.11.0] - 2026-11-02

### Added

- Template gallery: choice of 4, 3, 2 or 1 templates per row, remembered on the device

### Changed

- Template gallery: the orange icon on two-column templates is explained on hover and in the preview pane
- Public pages no longer jump while loading: the pre-generated page is reused as is at startup instead of being redrawn, and the footer no longer moves up before your eyes (layout shift divided by more than 50)
- Template gallery on phones: filters on a single scrolling row, help text hidden, almost twice as much room for the thumbnails
- Clearer wording, without jargon: "Book style" and "Typewriter style" filters, template descriptions without font names, "Download a backup" instead of "Export (JSON)"
- Accessibility: higher contrast for the step numbers on the home page, footer language links easier to tap, language selector and version number read as displayed by screen readers

### Security

- Photos from an imported backup are re-encoded like an uploaded photo: only a real image is kept

## [0.10.0] - 2026-11-02

### Added

- 20 new resume templates, for a total of 72: 14 graphic (Art Deco, Glass, Y2K, Riso, Collage, Marble, Stickers, Kraft, Wireframe, Chrono, Linocut, Candy, Metro, Stained glass) and 6 understated (Finance, Split, Airy, Cards, Linear, Typewriter)
- Redesigned template gallery: a preview pane renders the selected template with your resume or a sample resume, style filters (dark background, two columns, book style, typewriter style, paper, colorful, minimalist), favorites, recent templates, suggestions based on the job ad being targeted, keyboard navigation (arrows, Enter, Esc)
- Ctrl+Shift+← and Ctrl+Shift+→ shortcuts to change template without opening the gallery; the thumbnail of the current template is shown in the toolbar button

### Changed

- The gallery opens and scrolls smoothly: thumbnails are images, only one template is rendered at a time (the preview), and typing in the search no longer redraws the thumbnails
- Each template is downloaded only when displayed (about 10 KB instead of a 700 KB block for all templates); offline mode keeps them all in cache
- Changing templates several times in a row counts as a single undo step

## [0.9.0] - 2026-11-02

### Added

- 22 new resume templates, for a total of 52: 16 graphic (Horizon, Polaroid, Terminal, Retro, Mosaic, Cosmos, Botanical, Ticket, Comic, Postal, Arcade, Notebook, Circuit, Gazette, Topo, Watercolor) and 6 understated (Ledger, Compact, Academic, Monochrome, Soft, Outline), all read in the right order by ATS software, with a matching cover letter and "Fit on one page"
- Template button in the editor: arrows to go to the previous or next template without opening the gallery, and the position of the current template
- Template gallery: search by name or description, "Surprise me" button, four columns on large screens and automatic scrolling to the current template

## [0.8.1] - 2026-11-02

### Fixed

- App updates were no longer installed and the new version notification never appeared: the app stayed stuck on an old version
- Installed app (iPhone in particular): updates are also checked each time you return to the app, not only at launch

## [0.8.0] - 2026-11-02

### Changed

- Home page rewritten for everyone, in all 44 languages: less technical jargon, concrete benefits (free, no sign-up, 30 templates, matching cover letter) and a sample resume of a baker instead of a developer profile
- Analyzer: clearer title and introduction, "Test my resume" menu
- Title and description in search engines, and preview image of shared links, updated

## [0.7.0] - 2026-11-02

### Added

- Markdown version of each public page in each language (/index.md, /en/analyze/index.md…), also served at the same address to assistants that request Markdown (Accept: text/markdown)
- llms-full.txt file: all the site's text in French and English, for assistants
- Analyzer: the scoring grid (criteria and points) is displayed even before a resume is dropped

### Changed

- robots.txt: search engine and AI assistant crawlers are listed explicitly
- Dated sitemap (lastmod) and structured data on each public page (site, page, application, FAQ)
- Text served as explicit UTF-8 and compressed, Markdown included

### Fixed

- Home page: "Your data never" was not separated by a space for screen readers, and the decorative step numbers were read aloud

## [0.6.0] - 2026-11-02

### Added

- Interface translated into 44 languages, including Arabic, Hebrew, Persian and Urdu read from right to left
- One address per language for public pages (/en, /ja, /pt-br/analyze…), with hreflang and canonical tags and a sitemap generated automatically at build time
- Language selector with a search field (native name, translated name or code) and keyboard navigation
- Banner offering the browser's language on a first visit, and links to all languages in the footer
- Home page demo translated, with a sample resume in the interface language

### Changed

- Layout uses logical properties (start/end) so the interface mirrors cleanly in right-to-left mode; the resume preview stays left to right
- Interface translations loaded on demand instead of all being cached for offline use on the first visit

## [0.5.0] - 2026-11-01

### Added

- Ten new templates: Memphis, Duotone, Typo, Sorbet, Executive, Zen, Ribbon, Hexa, Origami and Thread, for a total of 30 templates
- Cover letter matching the design of the chosen resume: recipient, subject, standard phrases in the language of the resume, an outline to complete, dedicated PDF export; each targeted version can have its own letter
- "Fit on one page" button: spacing and then text size are reduced just enough, with manual settings and a way back to the template's layout
- Undo and redo throughout the editor (Ctrl+Z, Ctrl+Y), with buttons in the toolbar
- Import a Word resume (.docx), read in the browser like PDFs: paragraphs, tables, text boxes and page headers
- "View in black and white" button above the preview, to judge a grayscale printout (the PDF keeps its colors)
- Analyzer: new "File reading order" criterion, which spots PDFs whose text is written out of order (a trap of resumes made with free-form blocks, such as Canva), and a "File order" view of the text read by the robot

### Changed

- Template gallery: thumbnails shown with a complete sample resume (illustration photo included) or with your own resume, rendered as you scroll, and a loading indicator on the button
- Origami template: contact details in the banner and paper layers in a separate strip, without covering anything
- Zen template: the square seal is replaced by an ensō (a brush-drawn Zen circle)
- Analyzer scoring grid rebalanced to make room for the new criterion (readability still out of 40 points)
- More reliable column detection on PDFs split word by word
- Legal pages completed: private individual as publisher (address and phone number on request), personal hosting in Aix-en-Provence behind Cloudflare, credits (fonts, icons, libraries), cookies and user rights

### Fixed

- A section title no longer stays alone at the bottom of a page on multi-page resumes
- Zen template: a title in spaced capitals could be read as two words by ATS software
- Pulse template: thin gray line under the banner in the preview

## [0.4.0] - 2026-11-01

### Added

- Ten new graphic templates readable by ATS software: Bento, Bauhaus, Brutal, Editorial, Prism, Nocturne (dark mode), Wave, Blueprint, Swiss and Prestige, for a total of 20 templates
- All / Graphic / Understated filter in the template gallery
- 16 accent colors and a free color picker
- Five new fonts: Jost, Bricolage Grotesque, Archivo, Syne and Cormorant Garamond
- Language level: suggestions (A1 to C2, fluent, native…), an explanation and a live preview of the meter displayed by the templates
- Public pages pre-generated as HTML (home, analyzer, what's new, legal pages): their content can be read by search engines and AI crawlers, which do not run JavaScript
- SEO: description and canonical address for each page, preview image for links, structured data (web application and FAQ), sitemap, robots.txt and llms.txt
- Three new FAQ questions: graphic templates and ATS software, importing a resume or LinkedIn profile, working offline

### Changed

- Resume fonts are loaded only when a resume is displayed: the home page is lighter
- The live ATS check waits for fonts to load before measuring the layout
- PDF export: the template's background (dark, ivory, grid…) also fills the margins of the following pages

### Fixed

- Text order in PDFs exported with Aurora, Signature, Pulse, Impact and Modern: the header or experiences were written to the file after the rest, so ATS software reading the PDF in file order found them at the end

## [0.3.0] - 2026-11-01

### Added

- Three graphic templates designed for ATS software: Signature (organic shapes, large round photo, timeline), Aurora (one column, pastel shapes) and Pulse (slanted dark banner, cards, badges)
- QR code drawn in the resume pointing to the link of your choice (LinkedIn, GitHub, portfolio…), with the link's logo in the center
- LinkedIn, GitHub, YouTube and Instagram logos in front of links, a globe for other sites
- Driving license in the profile, displayed with a car icon
- Choice of heading and body font from 10 self-hosted fonts (Poppins, Montserrat, Lora, Playfair Display…)
- Bold keywords in bullet points with `**word**`
- LinkedIn import from the mobile app: the data archive (ZIP) is read directly in the browser
- "How the score is calculated" section in the analyzer, with the points of each criterion in detail

### Changed

- Two-column resumes are read column by column for content criteria: only the column layout itself is flagged
- Ligatures disabled in resumes so that "fi" or "ff" stay readable by all ATS software
- New and sample resumes are created with the Aurora template
- More compact Impact and Pulse templates: a one-page resume fits on one page when exported

### Fixed

- Header that slid sideways when going to a home page section (Privacy, How it works) from another page
- Home page sections partly hidden under the header after clicking in the menu
- "Choose a file" label in the LinkedIn import, which also accepts the ZIP archive

## [0.2.0] - 2026-11-01

### Added

- PDF export from the editor, with a resume in real text and a first page identical to the preview
- Impact template: photo banner, icons, timeline and language meters, while staying readable by ATS software
- Contact icons and language level meters in the Modern and Columns templates (drawings, invisible to ATS software)
- Live ATS check in the editor: the displayed layout is scored with the same engine as the analyzer
- Tailor a resume to a job ad (LinkedIn, Indeed, HelloWork…): keywords from the ad, match score, adding missing keywords and creating a pre-filled targeted version
- Detection of weak phrases in bullet points, with action verbs suggested in the language of the resume
- Import an existing PDF resume into the editor, including the profile PDF exported from LinkedIn
- "Bring this resume into our templates" button in the analyzer
- Legal notice, Terms of use and Privacy policy pages
- Six resume templates: Classic, Modern, Elegant, Tech, Minimal and Columns, with a preview of your own resume in each one and their ATS compatibility
- Analyzer for existing resumes: a PDF created with any tool is read in the browser, scored out of 100, with the points to fix and the text as an ATS reads it
- What's new page generated from this changelog
- Resume editor: form on the left, live A4 preview on the right with page break markers
- "My resumes" page with thumbnails, creating a blank resume or one from a sample, duplicating and deleting
- Automatic saving in IndexedDB, including the profile photo (resized in the browser)
- Backup and restore of all resumes in JSON format
- Targeted versions: checkboxes on each section, entry and bullet point to compose a tailored resume without deleting anything from the Master resume
- Drag and drop of sections, entries and bullet points, with a keyboard alternative (Move up / Move down)
- Resume language (FR, EN, IT, ES, DE): section titles and dates translated, photo, date of birth and nationality hidden in English
- Choice of resume accent color
- Animated transitions between pages
- Interface translated into Italian, Spanish and German (5 languages in total)
- New language selection menu, accessible by keyboard
- Screenshots in the README, which can be regenerated with `npm run screenshots`

### Fixed

- What's new page: shows the current version instead of "Next version"
- Site header that did not stay at the top of the screen while scrolling
- Cut-off text and slight horizontal scrolling on small screens
- Header navigation that overflowed on tablets
- Demo highlights invisible when the system asks for reduced motion

## [0.1.0] - 2026-11-01

### Added

- Application foundation: Angular 22 in 100% client mode, installable (PWA) and usable offline
- Landing page presenting how it works, privacy and features
- Light, dark or system theme, remembered on the device
- Interface in French and English, language remembered on the device
- Version number displayed in the footer, read from `package.json`
- "Report an issue" link opening a pre-filled GitHub issue (version, browser, page), without any resume data
- Notification when a new version of the app is available
- Docker image (nginx) with a strict security policy (CSP), cache suited to the service worker and no access logs

[0.11.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.11.0
[0.10.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.10.0
[0.9.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.9.0
[0.8.1]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.8.1
[0.8.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.8.0
[0.7.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.7.0
[0.6.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.6.0
[0.5.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.5.0
[0.4.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.4.0
[0.3.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.3.0
[0.2.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.2.0
[0.1.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.1.0
