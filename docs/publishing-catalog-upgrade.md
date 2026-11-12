# SOTR publishing catalogue: schema and administrator workflow

## Architecture

The application stores the authoritative catalogue as one JSON document in Vercel KV (`sotr:catalog`) and uses `data/catalog.json` as the local fallback. There is no relational database or ORM. The upgrade therefore stores normalized entity maps and junction records in that authoritative document, and enforces their relationships in `lib/adminData.js` before writes. This is equivalent application-level referential validation, not a database foreign-key constraint or a multi-key transaction.

Existing book keys and legacy display fields remain intact for the storefront and integrations. The migration adds normalized entity maps and junction rows; admin APIs join those rows for editing without copying multi-value relationships back onto book records:

- `BOOKS`: master work records, with a generated `sotrBookId`, separate parent/subcategory IDs, single-value audience/content/language/workflow fields, and the legacy storefront fields.
- `PUBLISHING_CATEGORIES` and `PUBLISHING_SUBCATEGORIES`: stable IDs and an explicit parent ID.
- `PUBLISHING_GENRES` and `PUBLISHING_SUBJECTS`: separate controlled value maps.
- `BOOK_GENRES` and `BOOK_SUBJECTS`: normalized book-to-value relationships, including primary-value and display-order metadata.
- `PUBLISHING_CONTENT_TYPES`, `PUBLISHING_AUDIENCES`, `PUBLISHING_READING_LEVELS`, `PUBLISHING_LANGUAGES`, `PUBLISHING_FORMATS`: separate reference dimensions.
- `AUTHORS` and `BOOK_CONTRIBUTORS`: normalized contributor identities, role and display order.
- `PUBLISHERS`: publisher reference records; legacy `details` publisher values are linked when present.
- `SERIES` and `BOOK_SERIES`: independent series records and book/series junction rows; volume number, reading order and publication order are distinct.
- `COLLECTIONS` and `BOOK_COLLECTIONS`: thematic collections are independent of series.
- `EDITIONS`: language/format-specific editions belong to one master book; ISBNs are edition identifiers.
- `DISTRIBUTION_CHANNELS` and `LISTINGS`: channel listings belong to editions.
- `KDP_MAPPINGS`: optional marketplace-specific category paths linked to listings, separate from SOTR taxonomy.

ISBN-10/ISBN-13 checksums and uniqueness are validated on writes. KDP category paths are administrator-entered and are not seeded with assumed Amazon paths. The UI supports at most three paths and records the last verification date.

## Approved editorial taxonomy

The migration seeds these eight parent categories and all 37 children:

1. **Biographies & Memoirs:** Biography; Memoir.
2. **Children's Books:** Children's Action & Adventure; Children's Educational Books; Children's Fairy Tales, Folktales & Myths; Children's History & Geography; Children's Illustrated Fiction; Children's Mysteries & Detectives; Children's Non-Fiction; Children's Picture Books; Children's Poetry; Children's Science, Nature & Discovery; Children's Science Fiction & Fantasy.
3. **History:** Historical Research; History & Civilization.
4. **Literature & Fiction:** Fantasy; Historical Fiction; Horror; Literary Fiction; Short Stories; Speculative Fiction.
5. **Mystery, Thriller & Suspense:** Crime Fiction; Espionage Fiction; Political Thriller; Psychological Thriller; Spy Thriller.
6. **Poetry:** Bilingual Poetry; Poetry.
7. **Politics & Social Sciences:** Behavioral Sociology; Cultural Criticism; Geopolitics; Geopolitical Theory; Philosophy; Social Essay; Socio-Political Essay; Technology & Society.
8. **Essays & Literary Collections:** Essay Collection.

Legacy genre text is retained. It is mapped to a publishing subcategory only when the exact label matches an approved child; all genre values remain separately represented as genre IDs. Unmatched or ambiguous values are reported for editorial review, not guessed.

## Migration procedure and report

1. Deploy the application change to the intended environment.
2. Sign in to `/admin` and open **Publishing**.
3. Confirm the catalogue schema is not yet migrated. Select **Back up and migrate catalogue** and confirm the prompt.
4. The server verifies the production KV document is readable before migration, creates a manual snapshot of the same catalogue document, migrates it, and writes the new schema version. If KV is unreadable or the backup fails, the migration stops and reports an error rather than copying the local JSON fallback into production.
5. Review the migration counts and any flagged legacy genres in the Publishing panel. Re-running the action after completion is a no-op.
6. Use **Catalog** to filter by category/subcategory, genre, subject, audience, age, status, language, edition format, distribution channel and listing status.

The report includes books preserved/migrated/updated/skipped, created series links, editions, listings, and unresolved classification mappings. Existing keys, title/description, cover URLs, purchase links, bundles and series volume lists are retained.

For legacy purchase links with a known `print`, `ebook` or `audio` grouping, migration creates a corresponding edition with an explicitly unspecified format variant and creates listings linked to the existing platform only when the link is a valid HTTP(S) URL. Placeholder values such as `#` remain untouched in the legacy links and do not become listings. It does not infer a paperback, Kindle, ISBN, ASIN, marketplace, publication date, original language, audience or age range. Existing `EN` and `EN / FR` language labels are used only to populate edition-language IDs when that is directly supported by the label. Publisher values are linked only when present in the existing publisher detail. Unknown publication workflow status remains unclassified.

A non-writing dry run against the current local `data/catalog.json` preserved all 51 books, produced 51 genre links and 46 series links, and reported no flags. It produced no editions or listings because the existing local purchase-link values are placeholders. This is a local snapshot result only; production KV has not been migrated or modified.

## Administrator workflow

### Register or edit a book

1. Open **Catalog** and select **Add Title** or the edit control for an existing book. Use the English, French and Spanish sub-tabs to enter localized titles; the English title remains the compatibility title and is required.
2. Enter the existing storefront information as needed. The generated legacy key remains an internal compatibility key; `SOTR Book ID` is a separate generated identifier and is read-only after creation.
3. In **Publishing record**, select a parent category. The subcategory selector stays disabled until a parent is selected and then shows only its active children. Changing parent clears an incompatible child.
4. Select genre(s) and subject(s) independently; select one primary value from each set where applicable. Add content type, audience, age range, reading level, and original language only when known.
5. Choose series memberships and enter volume number, volume label, reading order and publication order independently. Leave memberships empty for a standalone book. Add thematic collections separately.
6. Add one or more editions. For each, enter only known language, format, ISBN, ASIN, date, pages, trim size and pricing details.
7. Add edition-specific distribution listings. Add KDP category paths only after checking the relevant marketplace in KDP; fill in the verification date. SOTR categories are never overwritten by KDP values.
8. Save. Server validation rejects invalid parent/child pairs, inactive new selections, invalid series/collection/author references, duplicate series volume numbers, malformed/duplicate ISBNs, and incomplete classifications when a book is marked Ready for Publication or Published.

### Add collections and contributors

Create collection records and author/contributor profiles in **Publishing**. Select them in the book's publishing record and assign contributor roles. Records are linked once; using one book in several collections/series does not duplicate the master book.

### Choose homepage banner books

In **Catalog**, use the **Homepage banner** checkbox on each book row to control whether it appears in the homepage hero mosaic. The banner has four ordered spots. Selecting a fifth book automatically replaces the current fourth selection; unchecking a book frees its spot. Hidden books cannot be selected. The selection is saved to site configuration and used by the public catalogue API without requiring a redeployment.

### Browse the public catalogue by facets

On the homepage, **Browse by Category** acts as a faceted search. Each selected category, subcategory, genre, subject, audience, content type, edition language, format or age range narrows the available options in the other selectors to values associated with matching books. Clearing a selection expands the related options again.

### Manage book and series images

In a book or series editor, open the relevant language tab to upload an image and set its display size (small, medium or large) for that language. The **Use this image for** checkboxes let one uploaded file serve one, two or all three languages. Deleting an image removes it from the selected language; a shared image remains stored while another language still references it. A book's English image can also be managed from its synopsis editor.

### Choose footer catalogue books

In **Catalog**, use the **Footer** checkbox on each book row to control its presence in the website footer's catalogue links. Hidden books are omitted from the public footer and cannot be selected. Footer links display the title in the visitor's selected language.

### Create and manage series

The **Series** form supports English, French and Spanish sub-tabs for the series name, short description, concept heading/body and cover image. Create a series with books staged in the same form, or create a title directly from an existing series editor. Each book-language sub-tab supports a localized title, subtitle, cover, synopsis, genre display label, price/release display and volume label. The public site does not substitute English text when a French or Spanish value is missing; complete each language's fields in the admin forms to make that content appear in every language. Book language availability is selected separately and includes each individual language, every language pair and the three-language combination. Series and book visibility can be toggled independently; hiding a series removes it and its books from public catalogue responses, while hiding an individual book removes that title from public pages without deleting its record.

### Editorial status and storefront behavior

Workflow status (Draft through Discontinued) is distinct from the existing storefront availability and hidden flags. Migrated records with no authoritative editorial status remain unclassified. The public catalogue API exposes only the pre-existing storefront fields plus publishing category labels; it does not expose SOTR IDs, contributor internals, edition identifiers, private notes, listings or KDP mappings. Existing availability/hidden behavior is preserved.

## Validation

The migration test verifies that genre, subject, collection, contributor and series relationships are moved into their junction maps, while `BOOKS` retains no duplicate arrays for those dimensions. Legacy placeholders are not promoted to listings.

Run the focused schema/migration suite with:

```powershell
npm test
```

The tests cover all eight parents and 37 children, idempotent migration, preservation of legacy book fields and links, series and edition/listing relations, non-inference of ISBN/ASIN, and server-side parent/child validation.

## Known boundaries

- The storage remains a whole-catalog JSON/KV document. The application validates relationships, but concurrent writes are not protected by relational transactions or compare-and-swap.
- Taxonomy reference values are controlled in `lib/publishingSchema.js`; the admin UI does not permit editors to create arbitrary categories or genres. Existing values can be deactivated in data without deleting historical references; inactive values are not offered for new selections.
- The legacy storefront continues to use its original `available`, `hidden`, `genre`, `links`, and series fields. New publishing values are not substituted for those fields, preventing a breaking public-site rewrite.
- The current source catalogue inspection found no ISBN/ASIN or explicit edition-format fields and no author profiles. Such details require publisher entry; they are not fabricated during migration.
