# Run Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\python manage.py runserver"

# Run Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend-web; npm run dev"

# Run Mobile
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'SOAVS mob'; npm start"

Write-Host "Starting SOAVS Backend, Frontend, and Mobile..." -ForegroundColor Green
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:5173"
Write-Host "Mobile: (Expo started in separate window)"
