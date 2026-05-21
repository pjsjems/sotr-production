 Book Cover Images

Place all book cover images in this folder.

## Naming Convention

Use the book key from `data/catalog.js` as the filename:

| Book | Filename |
|------|----------|
| The Kremlin Coup (Mercer 1) | `mercer1.jpg` |
| The Prague Protocol (Mercer 2) | `mercer2.jpg` |
| The Beijing Residue (Mercer 3) | `mercer3.jpg` |
| The Zurich Legacy (Mercer 4) | `mercer4.jpg` |
| The Oslo Signal (Mercer 5) | `mercer5.jpg` |
| Mercer Book 6 | `mercer6.jpg` |
| The Last Architecture (Mercer 7) | `mercer7.jpg` |
| Anatomy Vol. 1 | `anatomy1.jpg` |
| Anatomy Vol. 2 | `anatomy2.jpg` |
| Anatomy Vol. 3 | `anatomy3.jpg` |
| Anatomy Vol. 4 | `anatomy4.jpg` |
| Anatomy Vol. 5 | `anatomy5.jpg` |
| Anatomy Vol. 6 | `anatomy6.jpg` |
| Anatomy Vol. 7 | `anatomy7.jpg` |
| Anatomy Vol. 8 | `anatomy8.jpg` |
| Murder in the Bunker | `crooked1.jpg` |
| The Shadow Performer | `crooked2.jpg` |
| The Orderly's Ledger | `crooked3.jpg` |
| The Librarian of Geneva | `crooked4.jpg` |
| The Last Myth | `crooked5.jpg` |
| The Chess–Go Game | `chess.jpg` |
| Chokepoints | `chokepoints.jpg` |
| The Evaporating Empire | `evaporating.jpg` |
| The Sea on Trial | `seatrial.jpg` |
| The War of Orbits | `warorbits.jpg` |
| Iran: The Laboratory | `iran.jpg` |
| Atlas of the Unspoken | `atlas.jpg` |
| The Teacher's Gun | `teacher.jpg` |
| The Neural Mortgage | `neural.jpg` |
| The Invisible Authority | `invisible.jpg` |
| Haiti X-Ray | `haiti.jpg` |
| Neon Shadows | `neon.jpg` |

## Image Requirements

- **Format**: JPG or PNG (JPG recommended for photos, PNG for illustrations)
- **Minimum size**: 800px on the short side (for crisp display on retina screens)
- **Recommended size**: 1200 x 1800px (2:3 ratio, standard book cover))
- **File size**: Keep under 500KB per image (compress with squoosh.app or TinyPNG)

## How Covers Are Used

Once you add a cover image here, update the book's entry in `data/catalog.js`
to add an `image` field:

```js
mercer1: {
  ...
  image: '/covers/mercer1.jpg',
  ...
}
```

The site will automatically show the real cover instead of the color placeholder.

## Placeholder System

Until a real cover is added, the site shows a colored placeholder panel
with the genre pill, title, and ornament overlaid. This is fully functional
and readable; real covers simply enhance the presentation.
