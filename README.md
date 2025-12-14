# KK Karađorđevo - Zvanični Web Sajt

Moderan, mobile-first web sajt za Košarkaški klub Karađorđevo.

## 🏀 O Projektu

Zvanični web sajt košarkaškog kluba Karađorđevo, izgrađen sa Astro 5, Tailwind CSS i DaisyUI. Sajt prikazuje vesti, turnire, galeriju i informacije o klubu.

## 🚀 Tech Stack

- **Astro 5.16.5** - Statički site generator
- **Tailwind CSS 3** - Utility-first CSS framework
- **DaisyUI** - Komponente za Tailwind
- **TypeScript** - Type safety
- **date-fns** - Formatiranje datuma
- **lite-youtube-embed** - Lazy loading YouTube videa
- **PhotoSwipe** - Galerija slika

## 📁 Struktura Projekta

```
/
├── public/
│   ├── images/news/     # Slike za vesti
│   ├── logo.png         # Logo kluba
│   └── favicon.svg      # Favicon
├── src/
│   ├── components/
│   │   ├── layout/      # Header, Footer
│   │   ├── news/        # NewsCard, NewsContent, Pagination
│   │   └── shared/      # YouTubeEmbed, SocialShare
│   ├── content/
│   │   ├── vesti/       # 132 vesti (JSON)
│   │   ├── turniri/     # 12 turnira (JSON)
│   │   ├── about/       # 2 o nama stranice (JSON)
│   │   └── config.ts    # Content Collections config
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── vesti/
│   │   ├── turniri/
│   │   ├── galerija/
│   │   └── o-nama/
│   └── utils/           # formatDate, slugify, truncateText
└── package.json
```

## 🧞 Komande

Sve komande se izvršavaju iz root-a projekta:

| Komanda               | Akcija                                           |
| :-------------------- | :----------------------------------------------- |
| `npm install`         | Instalira dependencies                           |
| `npm run dev`         | Pokreće dev server na `localhost:4321`           |
| `npm run build`       | Build za produkciju u `./dist/`                  |
| `npm run preview`     | Preview production build-a lokalno               |

## 🎨 Boje Kluba

```css
--kk-primary: #1a5490;    /* Košarkaška plava */
--kk-secondary: #f97316;  /* Košarkaška narandžasta */
--kk-dark: #1e293b;       /* Tamna */
```

## 📄 Stranice

- **Početna** (`/`) - Hero sekcija + 10 najnovijih vesti
- **Vesti** (`/vesti/[page]`) - Paginacija vesti (10 po stranici)
- **Vest detalji** (`/vesti/[slug]`) - Pojedinačna vest sa slikama i video
- **Turniri** (`/turniri`) - Lista svih turnira
- **Turnir detalji** (`/turniri/[slug]`) - Pojedinačan turnir
- **O nama** (`/o-nama`) - Informacije o klubu
- **Galerija** (`/galerija`) - Slike (u izradi)

## 🚧 U izradi

- Galerija sa PhotoSwipe i infinity scroll
- Admin panel za dodavanje vesti
- SEO optimizacija

## 📝 Deployment

Sajt je konfigurisan za deployment na Netlify:

```bash
npm run build
```

Build output će biti u `dist/` folderu.

---

🤖 Generisano sa [Claude Code](https://claude.com/claude-code)
