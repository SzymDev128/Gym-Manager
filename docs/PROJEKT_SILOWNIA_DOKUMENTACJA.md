# Projekt: System Zarządzania Siłownią – Dokumentacja

Autor: [Imię Nazwisko]
Grupa: [Grupa/Lab]
Prowadzący: [Prowadzący]
Data: [DD.MM.RRRR]

Repozytorium: Gym-Manager
Technologie: Next.js (App Router), TypeScript, Prisma ORM, MS SQL Server, Chakra UI

## Spis treści
- 1. Cel i zakres projektu
- 2. Założenia i wymagania
- 3. Modele danych (ER Chen, Barker, UML)
- 4. Konwersja do modelu relacyjnego (SQL Server)
- 5. Schemat bazy danych i migracje
- 6. Dane testowe (seed) – 15+ rekordów na tabelę
- 7. Zapytania SQL (INSERT/UPDATE/DELETE/SELECT)
- 8. Aplikacja kliencka – interfejs i funkcjonalności
- 9. Integracja narzędzia raportowego
- 10. Zrzuty ekranu interfejsu
- 11. Instrukcja uruchomienia
- 12. Wnioski i dalszy rozwój
- 13. Załączniki

---

## 1. Cel i zakres projektu
Celem projektu jest zaprojektowanie i implementacja systemu wspierającego zarządzanie siłownią (użytkownicy, członkostwa, pracownicy, trenerzy, zajęcia, sprzęt, konserwacje, płatności, wejścia).

## 2. Założenia i wymagania
- Baza danych: Microsoft SQL Server
- Min. 10 encji – projekt zawiera 13
- Diagramy: ER (Chen), ER (Barker), UML (klasy)
- Wymagane elementy modelu: atrybut wielowartościowy, hierarchia encji, relacja opcjonalna/obowiązkowa, związek unarny, relacja z atrybutami
- Min. 15 rekordów w każdej tabeli
- 15+ zapytań SELECT z: JOIN (wewn./zewn.), GROUP BY, ORDER BY, podzapytania (skorelowane/nieskorelowane), HAVING, IN, ANY, ALL, EXISTS, LIKE
- Aplikacja kliencka: przeglądanie, wyszukiwanie, dodawanie, usuwanie bez operowania kluczami

## 3. Modele danych (ER Chen, Barker, UML)

### 3.1. ER w notacji Chen
- Encje: Role, User, PhoneNumber, Membership, UserMembership, Employee, Trainer, Receptionist, Class, Equipment, Maintenance, Payment, CheckIn
- Atrybut wielowartościowy: PhoneNumber (User—PhoneNumber 1:N)
- Związek unarny: Trainer—Trainer (supervisor)
- Relacja z atrybutami: UserMembership (startDate, endDate, active)
- Relacje opcjonalne: Class—Trainer (Class może nie mieć trenera), User—Employee (User może nie być Employee)
- Relacje obowiązkowe: User—Role (User musi mieć Role)

[Wstaw diagram Chen jako obrazek PNG/SVG]

### 3.2. ER w notacji Barker (crow’s foot)
- Role 1—N User
- User 1—N PhoneNumber
- User 1—0..1 Employee; Employee 1—0..1 Trainer; Employee 1—0..1 Receptionist
- Trainer 0..1—N Trainer (self)
- Trainer 0..1—N Class
- User 1—N UserMembership N—1 Membership
- UserMembership 1—N Payment
- Equipment 1—N Maintenance
- User 1—N CheckIn

[Wstaw diagram Barker jako obrazek PNG/SVG]

### 3.3. UML – Diagram klas
Plik źródłowy PlantUML: `docs/uml-diagram.puml`  
Sugerowany eksport: PNG/SVG

Relacje i krotności (najważniejsze):
- Role "1" -- "0..*" User (asocjacja obowiązkowa po stronie User)
- User "1" o-- "1..*" PhoneNumber (atrybut wielowartościowy)
- User "1" -- "0..1" Employee (opcjonalne 1:1)
- Employee "1" <|-- "0..1" Trainer; Employee "1" <|-- "0..1" Receptionist (hierarchia)
- Trainer "0..1" -- "0..*" Trainer (związek unarny supervisor)
- Trainer "0..1" -- "0..*" Class (trener opcjonalny)
- User "1" *-- "0..*" UserMembership; Membership "1" -- "0..*" UserMembership (M:N z atrybutami)
- UserMembership "1" *-- "0..*" Payment (silna zależność)
- User "1" *-- "0..*" CheckIn (silna zależność)
- Equipment "1" *-- "0..*" Maintenance (silna zależność)

[Wstaw render UML jako obrazek PNG/SVG]

## 4. Konwersja do modelu relacyjnego (SQL Server)
- Implementacja via Prisma ORM (provider `sqlserver`)
- Klucze główne: kolumny `id` (autoincrement, int) lub dziedziczone (Trainer/Receptionsit jako 1:1 z Employee)
- Klucze obce i kardynalności odzwierciedlają relacje z sekcji 3
- Tabela łącząca z atrybutami: `UserMembership`
- Związek unarny: `Trainer.supervisorId` → `Trainer.id`
- Przykładowe decyzje: `onDelete: Cascade` dla encji zależnych (CheckIn, Payment), `NoAction` dla Role

[Opisz mapowanie wybranych związków na FKs i ograniczenia]

## 5. Schemat bazy danych i migracje
- Pliki migracji: `prisma/migrations/*`
- Główne tabele: Role, User, PhoneNumber, Membership, UserMembership, Employee, Trainer, Receptionist, Class, Equipment, Maintenance, Payment, CheckIn
- Zrzut schematu (opcjonalnie): [tu wstawić wygenerowany diagram relacyjny]

## 6. Dane testowe (seed) – 15+ rekordów na tabelę
- Skrypt: `prisma/seed.ts`
- Generuje: 20 Users, 10 Trainers, 5 Receptionists, 18 Equipment, 20+ Maintenance, 16 Classes, 25 CheckIns, 15+ UserMembership, 20+ Payments, 20–40 PhoneNumbers, 5 Memberships, 5 Roles
- Uruchomienie:

```powershell
npx prisma db seed
```

## 7. Zapytania SQL (INSERT/UPDATE/DELETE/SELECT)

### 7.1. Dodawanie (INSERT) – sekwencje
- Rejestracja użytkownika: `POST /api/auth/register`
- Zatrudnienie pracownika: `POST /api/employees`
- Dodanie zajęć: `POST /api/classes`
- Dodanie sprzętu: `POST /api/equipment`
- Dodanie konserwacji: `POST /api/maintenance`
- Check-in: `POST /api/checkins`

### 7.2. Modyfikacja/Usuwanie (UPDATE/DELETE)
- `PATCH /api/users/[id]`, `DELETE /api/users/[id]`
- `PATCH /api/classes/[id]`, `DELETE /api/classes/[id]`
- `PATCH /api/equipment/[id]`, `DELETE /api/equipment/[id]`
- `PATCH /api/employees/[id]` (zmiana supervisor)

### 7.3. Pobieranie (SELECT) – 15+ zapytań
- Endpoint: `GET /api/stats` – zawiera przykłady: GROUP BY, HAVING, LEFT JOIN, podzapytania (skorelowane/nieskorelowane), IN, EXISTS, ANY, ALL, ORDER BY
- LIKE (wyszukiwanie): `GET /api/users`, `GET /api/equipment`
- Self-join: `GET /api/employees?role=trainer` (supervisor/subordinates)

[Tu wstawić listę zapytań w czystym SQL i ich wyniki]

## 8. Aplikacja kliencka – interfejs i funkcjonalności
- Widoki: `/users`, `/equipment`, `/equipment/[id]`, `/classes`, `/trainers`, `/memberships`
- Operacje: przeglądanie, wyszukiwanie, dodawanie, edycja, usuwanie (bez posługiwania się FK)
- Ochrona dostępu: `AuthGuard`, `RoleGuard`

## 9. Integracja narzędzia raportowego
- Warstwa raportowa oparta o endpoint `GET /api/stats`
- Możliwe integracje: Power BI (pobranie danych z API), SSRS (raporty na bazie widoków/Stored Procedures), Excel (PowerQuery)
- Sposób integracji (przykład Power BI):
  1. Utwórz parametr z URL API (`http://localhost:3000/api/stats`)
  2. Źródło danych: „Z sieci (Web)”, format JSON
  3. Zmapuj sekcje (usersByRole, equipmentWithLatestMaintenance, ...)
  4. Zbuduj wizualizacje (słupki, tabele, KPI)

## 10. Zrzuty ekranu interfejsu
Umieść pliki w `docs/assets/screenshots/` i wstaw poniżej:
- Dashboard/Statystyki
- Lista użytkowników
- Sprzęt i konserwacje
- Trenerzy (przełożeni/podwładni)
- Zajęcia (przypisanie trenera)

## 11. Instrukcja uruchomienia

### Wymagania
- Node.js 18+
- MS SQL Server + connection string w `.env` (`DATABASE_URL`)

### Kroki
```powershell
# Instalacja zależności
yarn

# Migracje bazy
yarn prisma migrate deploy

# Seed danych
npx prisma db seed

# Start aplikacji (dev)
yarn dev
```

## 12. Wnioski i dalszy rozwój
- Możliwe rozszerzenia: grafiki frekwencji, rezerwacje zajęć, obsługa faktur, integracja płatności online, notyfikacje, role granularne

## 13. Załączniki
- `docs/uml-diagram.puml`
- Zrzuty ekranu
- Pliki .sql z zapytaniami (jeśli przygotowane)
