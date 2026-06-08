# warehouse-management-api


A Django-based multi-tenant application using `django-tenants` for organization-based schema separation. Each tenant gets its own schema and isolated data.

---

## Prerequisites

- Python 3.12+
- PostgreSQL 15+
- pip

---

## 🔥 ONE-CLICK SETUP (5 Minutes)

### 1. Clone & Environment

```bash
git clone https://github.com/Indi4/warehouse-management-api.git
cd warehouse-management-api

# Create & activate virtual environment
python -m venv denv
source denv/bin/activate      # Mac/Linux
denv\Scripts\activate         # Windows

# Install dependencies
pipenv install     # To install dependecies 
pipenv shell       # To activate the environment 

OR DO
pip install -r requirments.txt


## Migrations
python manage.py makemigrations
python manage.py migrate_schemas --shared

## Initialize System
python manage.py initial_setup
