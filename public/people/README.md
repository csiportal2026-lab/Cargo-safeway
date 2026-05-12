# Seafarer placeholder photos

12 testimonial-card photos, one per person in `app/inquire/Testimonials.tsx`.
Filenames must match the `slug` field, with `.jpg` extension.

Mapping (left-to-right, top-to-bottom across the 3×4 grid):

| Row | Col | Slug          | Name        | Role                              |
|-----|-----|---------------|-------------|-----------------------------------|
| 1   | 1   | jessa-c       | Jessa C.    | Cabin Steward · cruise line       |
| 1   | 2   | mark-g        | Mark G.     | Bosun · M/V Cebu Trader           |
| 1   | 3   | edwin-t       | Edwin T.    | 2nd Engineer · M/T Asian Gulf     |
| 1   | 4   | joseph-p      | Joseph P.   | Ordinary Seaman · feeder vessel   |
| 2   | 1   | grace-r       | Grace R.    | Asst Cook · M/V Coral Princess    |
| 2   | 2   | edgar-l       | Edgar L.    | Bosun · Aframax tanker            |
| 2   | 3   | kris-n        | Kris N.     | 3rd Officer · M/V Sirius Bay      |
| 2   | 4   | joel-b        | Joel B.     | Ordinary Seaman · feeder vessel   |
| 3   | 1   | rolando-d     | Rolando D.  | Chief Officer · M/V Pacific Crest |
| 3   | 2   | johnny-b      | Johnny B.   | Pumpman · M/T Solaris             |
| 3   | 3   | cristine-b    | Cristine B. | Cabin Attendant · cruise line     |
| 3   | 4   | vince-c       | Vince C.    | Wiper · M/V Star Coral            |

Recommended specs: square crop, 200×200 minimum, face roughly centered,
JPEG quality 80.

If a slug file is missing, the card falls back to a randomuser.me
placeholder so the page never breaks.
