# Dinesh Timilsena — Portfolio

Premium personal portfolio for a **Data Engineer | AI/ML Engineer**, built with
**plain HTML, CSS and vanilla JavaScript** — no frameworks, no animation libraries.

```
index.html          → all content & markup (semantic, accessible)
css/style.css       → design tokens (CSS variables), layout, animations
js/script.js        → interactions + CONFIG (your links) + PROJECTS (case studies)
public/assets/      → images and resume (copied as-is to the build)
```

## Replace the placeholders

Placeholders appear on the page in **amber dashed boxes** like `[YOUR PHOTO]`.

1. **Links** — open `js/script.js` and fill in `CONFIG`:
   ```js
   const CONFIG = {
     email: "you@example.com",
     github: "your-github-username",
     linkedin: "https://www.linkedin.com/in/your-handle",
     resume: "public/assets/resume/resu_me.pdf.html",
     introVideo: "public/assets/video/intro.mp4"
   };
   ```
   Setting `github` also loads **real** GitHub data (profile, repos, languages,
   contribution graph) from the public GitHub API.
2. **Profile photo** — done: your photo lives at
   `public/assets/images/…` and is wired into the `.portrait__photo` block in `index.html`.
3. **Resume** — done: `public/assets/resume/resu_me.pdf.html`, linked from
   `CONFIG.resume`. Open it in a browser and use **Print → Save as PDF** to
   export an A4 PDF copy.
4. **Projects** — edit the cards in `index.html` and the case-study data in
   `PROJECTS` inside `js/script.js`.
5. **Journey, education, certifications, metrics** — search `index.html` for `class="ph"`.
6. **Skills depth** — edit `data-level` (3 core · 2 working · 1 exploring) in the Skills Matrix.

## Notes

- Respects `prefers-reduced-motion`.
- Keyboard accessible: skip link, focus states, native `<dialog>` for the project modal.
- The LLM visualization is a deterministic **simulation** for teaching purposes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
