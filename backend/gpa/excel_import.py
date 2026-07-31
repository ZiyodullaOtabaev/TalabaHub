import openpyxl
from io import BytesIO


def parse_gpa_excel(file_bytes):
    """
    Excel (.xlsx) fayldan fanlar, kreditlar, baholar va semestrlarni ajratib olish.
    Qaytaradi: list of dicts [{'name': '...', 'credit': 4, 'grade': '5', 'semester': '1'}]
    """
    wb = openpyxl.load_workbook(filename=BytesIO(file_bytes), data_only=True)
    sheet = wb.active

    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return []

    # Sarlavhalarni topish (Header row)
    header_idx = None
    col_map = {}

    for idx, row in enumerate(rows):
        if not row:
            continue
        row_str = [str(cell).strip().lower() if cell is not None else "" for cell in row]
        
        # Har bir ustunni aniqlash
        name_col = next((i for i, c in enumerate(row_str) if any(kw in c for kw in ["fan", "subject", "nomi", "course", "title"])), None)
        credit_col = next((i for i, c in enumerate(row_str) if any(kw in c for kw in ["kredit", "credit", "krediti"])), None)
        grade_col = next((i for i, c in enumerate(row_str) if any(kw in c for kw in ["baho", "grade", "mark", "ball"])), None)
        sem_col = next((i for i, c in enumerate(row_str) if any(kw in c for kw in ["semestr", "semester", "term"])), None)

        if name_col is not None and (credit_col is not None or grade_col is not None):
            header_idx = idx
            col_map = {
                "name": name_col,
                "credit": credit_col,
                "grade": grade_col,
                "semester": sem_col,
            }
            break

    # Agar sarlavha topilmasa, standart ustunlar bo'yicha olamiz (0: Fan, 1: Kredit, 2: Baho, 3: Semestr)
    if header_idx is None:
        header_idx = 0
        col_map = {"name": 0, "credit": 1, "grade": 2, "semester": 3}

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

        raw_name = get_val("name")
        if not raw_name or raw_name.lower() in ["jami", "total", "gpa", "o'rtacha"]:
            continue

        # Credit parse
        raw_credit = get_val("credit")
        try:
            credit = int(float(raw_credit)) if raw_credit else 3
            if credit <= 0:
                credit = 3
        except (ValueError, TypeError):
            credit = 3

        # Grade parse
        raw_grade = get_val("grade").upper()
        grade = "5"
        if raw_grade in ["5", "4", "3", "2"]:
            grade = raw_grade
        elif raw_grade in ["A+", "A", "A-"]:
            grade = "5"
        elif raw_grade in ["B+", "B", "B-"]:
            grade = "4"
        elif raw_grade in ["C+", "C", "C-"]:
            grade = "3"
        elif raw_grade in ["D+", "D", "F"]:
            grade = "2"
        elif raw_grade.isdigit():
            val = int(raw_grade)
            if val >= 86:
                grade = "5"
            elif val >= 71:
                grade = "4"
            elif val >= 55:
                grade = "3"
            else:
                grade = "2"

        # Semester parse
        raw_sem = get_val("semester")
        sem_digits = "".join(filter(str.isdigit, raw_sem))
        semester = sem_digits if sem_digits and 1 <= int(sem_digits) <= 8 else "1"

        results.append({
            "name": raw_name,
            "credit": credit,
            "grade": grade,
            "semester": semester,
        })

    return results
