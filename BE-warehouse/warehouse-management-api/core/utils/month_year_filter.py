import calendar
import re
from calendar import month_name, month_abbr
from datetime import datetime


class MonthYearFilter:

    @staticmethod
    def normalize_month(raw_month: str) -> int | None:
        if not raw_month:
            return None

        raw = raw_month.strip().lower()

        for i in range(1, 13):
            if raw in month_name[i].lower() or raw in month_abbr[i].lower():
                return i

        return None

    @staticmethod
    def get_month_range(month: int, year: int):
        start_date = datetime(year, month, 1)
        last_day = calendar.monthrange(year, month)[1]
        end_date = datetime(year, month, last_day, 23, 59, 59)

        return start_date, end_date

    @classmethod
    def apply_month_year_filter(cls, query_params, month, year, field="created_at"):
        now = datetime.now()

        # Normalize month
        if not month:
            month = now.month
        else:
            month = cls.normalize_month(month)
            if not month:
                raise ValueError("Invalid month format")

        # Normalize year
        if not year:
            year = now.year
        else:
            year = int(year)

        # Get range
        start_date, end_date = cls.get_month_range(month, year)

        # Inject filters
        query_params[f"{field}__gte"] = start_date.isoformat()
        query_params[f"{field}__lte"] = end_date.isoformat()

        # Clean params
        query_params.pop("month", None)
        query_params.pop("year", None)

        return query_params

    @staticmethod
    def get_financial_year_range(fy: str):
        """
        Accepts ONLY: "YYYY-YYYY" (e.g., "2025-2026")
        Returns:
            start_date = 1 Apr YYYY
            end_date   = 1 Apr (YYYY+1)  [exclusive boundary]
        """
        if not fy:
            raise ValueError("Financial year is required")

        fy = fy.strip()

        match = re.match(r"^(\d{4})-(\d{4})$", fy)
        if not match:
            raise ValueError("Invalid financial year format. Use YYYY-YYYY")

        start_year = int(match.group(1))
        end_year = int(match.group(2))

        if end_year != start_year + 1:
            raise ValueError("Invalid financial year range")

        start_date = datetime(start_year, 4, 1)
        end_date = datetime(end_year, 4, 1)  # ✅ next FY start (exclusive)

        return start_date, end_date

    @classmethod
    def apply_financial_year_filter(cls, query_params, financial_year, field="created_at"):
        now = datetime.now()

        # ✅ Auto-detect current FY if not provided
        if not financial_year:
            if now.month >= 4:
                financial_year = f"{now.year}-{now.year + 1}"
            else:
                financial_year = f"{now.year - 1}-{now.year}"

        # ✅ Get date range from strict parser
        start_date, end_date = cls.get_financial_year_range(financial_year)

        # ✅ Use safe boundary filtering
        query_params[f"{field}__gte"] = start_date.isoformat()
        query_params[f"{field}__lt"] = end_date.isoformat()

        # ✅ Clean params
        query_params.pop("financial_year", None)

        return query_params