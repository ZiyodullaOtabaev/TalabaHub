import openpyxl
from io import BytesIO


WEEKDAY_MAP = {
    "dushanba": 0, "mon": 0, "monday": 0, "1": 0,
    "seshanba": 1, "tue": 1, "tuesday": 1, "2": 1,
    "chorshanba": 2, "wed": 2, "wednesday": 2, "3": 2,
    "payshanba": 3, "thu": 3, "thursday": 3, "4": 3,
    "juma": 4, "fri": 4, "friday": 4, "5": 4,
    "shanba": 5, "sat": 5, "saturday": 5, "6": 5,
    "yakshanba": 6, "sun": 6, "sunday": 6, "7": 6,
}


def parse_timetable_excel(file_bytes):
    """
    Excel (.xlsx) fayldan dars jadvali ma'lumotlarini ajratib olish.
    Qaytaradi: list of dicts [{'subject': '...', 'weekday': 0, 'start_time': '09:00', 'end_time': '10:20', 'room': '201', 'teacher': '...'}]
    """
    wb = openpyxl.load_workbook(filename=BytesIO(file_bytes), data_only=True)
    sheet = wb.active

    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return []

    header_idx = None
    col_map = {}

    for idx, row in enumerate(rows):
        if not row:
            continue
        row_str = [str(cell).strip().lower() if cell is not None else "" for cell in row]

        subject_col = next((i for i, c in enumerate(row_str) if any(kw in c for kw in ["fan", "subject", "nomi", "course"])), None)
        day_col = next((i for i, c in enumerate(row_str) if any(kw in c for kw in ["kun", "day", "hafta", "weekday"])), None)
        start_col = next((i for i, c in enumerate(row_str) if any(kw in c for kw in ["boshlanish", "start", "vaqt", "time"])), None)
        end_col = next((i for i, c in enumerate(row_str) if any(kw in c for kw in ["tugash", "end", "tugal"])), None)
        room_col = next((i for i, c in enumerate(row_str) if any(kw in c for kw in ["xona", "room", "auditoriya", "cabinet"])), None)
        teacher_col = next((i for i, c in enumerate(row_str) if any(kw in c for kw in ["o'qituvchi", "teacher", "domla", "professor"])), None)

        if subject_col is not None:
            header_idx = idx
            col_map = {
                "subject": subject_col,
                "weekday": day_col,
                "start_time": start_col,
                "end_time": end_col,
                "room": room_col,
                "teacher": teacher_col,
            }
            break

    if header_idx is None:
        header_idx = 0
        col_map = {
            "subject": 0,
            "weekday": 1,
            "start_time": 2,
            "end_time": 3,
            "room": 4,
            "teacher": 5,
        }

    results = []
    for row in rows[header_idx + 1:]:
        if not row or not any(row):
            continue

        def get_val(col_key):
            c_idx = col_map.get(col_key)
            if c_idx is not None and c_idx < len(row):
                val = row[c_idx]
                return str(val).strip() if val is not None else ""
            return ""

        raw_subject = get_val("subject")
        if not raw_subject:
            continue

        # Weekday parse
        raw_day = get_val("weekday").lower()
        weekday = 0
        for k, v in WEEKDAY_MAP.items():
            if k in raw_day:
                weekday = v
                break

        start_time = get_val("start_time") or "09:00"
        end_time = get_val("end_time") or "10:20"

        # Format times if needed
        if len(start_time) == 4 and ":" in start_time:
            start_time = "0" + start_time
        if len(end_time) == 4 and ":" in end_time:
            end_time = "0" + end_time

        if ":" not in start_time:
            start_time = "09:00"
        if ":" not in end_time:
            end_time = "10:20"

        room = get_val("room")
        teacher = get_val("teacher")

        results.append({
            "subject": raw_subject,
            "weekday": weekday,
            "start_time": start_time[:5],
            "end_time": end_time[:5],
            "room": room,
            "teacher": teacher,
        })

    return results
