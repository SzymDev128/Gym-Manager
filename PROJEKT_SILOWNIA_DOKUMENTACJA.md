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

### 3.0. Warunki i założenia poprawności modeli

- Dane osobowe użytkowników (User) są unikalne w zakresie `email`; `email` jest identyfikatorem logowania i nie może się powtarzać.
- Każdy użytkownik musi posiadać jedną rolę (`roleId` NOT NULL). Usunięcie roli z przypisanymi użytkownikami jest zabronione (FK restrykcyjny – NoAction) – najpierw należy przepiąć użytkowników.
- Atrybut wielowartościowy numeru telefonu jest znormalizowany do encji `PhoneNumber`; numer telefonu zawsze należy do dokładnie jednego użytkownika (FK NOT NULL, kaskada na usunięcie użytkownika).
- Hierarchia pracownicza: `Employee` istnieje tylko dla użytkowników będących pracownikami. Specjalizacje `Trainer` i `Receptionist` dziedziczą identyfikator pracownika (1:1) i nie mogą istnieć bez `Employee`.
- Związek unarny trenerów: `Trainer.supervisorId` może być NULL (brak przełożonego). Przełożony musi być istniejącym trenerem (spójność referencyjna). System nie dopuszcza ustawienia trenera jako własnego przełożonego ani tworzenia cykli (logika aplikacji).
- Zajęcia (`Class`) mogą, ale nie muszą mieć przypisanego trenera (`trainerId` NULL). Usunięcie trenera nie usuwa zajęć (NoAction) – spójność merytoryczna: zajęcia mogą zostać nieobsadzone.
- Członkostwa użytkowników (`UserMembership`) odwzorowują relację M:N z atrybutami (`startDate`, `endDate`, `active`). Rekord `UserMembership` wymaga istniejącego `User` i `Membership` (oba FKs NOT NULL).
- Płatności (`Payment`) są powiązane wyłącznie z konkretnym przypisaniem `UserMembership`; usunięcie `UserMembership` usuwa powiązane płatności (onDelete: Cascade). Kwoty płatności są dodatnie.
- Rejestry wejść (`CheckIn`) są ściśle powiązane z `User` (FK NOT NULL, kaskada przy usunięciu użytkownika). `checkOutTime` może być NULL (użytkownik jeszcze na siłowni).
- Sprzęt (`Equipment`) posiada rekordy konserwacji (`Maintenance`); konserwacje nie istnieją bez sprzętu (FK NOT NULL). Koszt konserwacji jest nieujemny.
- Wszystkie daty (`startTime`, `hireDate`, `purchaseDate`, `date`) mieszczą się w realistycznych zakresach kalendarzowych; `endDate` ≥ `startDate`.
- Integralność biznesowa: rola `TRAINER` wymaga istnienia `Employee` i rekordu `Trainer`; rola `RECEPTIONIST` wymaga `Employee` i `Receptionist`. Zmiana roli użytkownika automatycznie provisionuje lub usuwa podencje zgodnie z logiką API.

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

- Role "1" -- "0..\*" User (asocjacja obowiązkowa po stronie User)
- User "1" o-- "1..\*" PhoneNumber (atrybut wielowartościowy)
- User "1" -- "0..1" Employee (opcjonalne 1:1)
- Employee "1" <|-- "0..1" Trainer; Employee "1" <|-- "0..1" Receptionist (hierarchia)
- Trainer "0..1" -- "0..\*" Trainer (związek unarny supervisor)
- Trainer "0..1" -- "0..\*" Class (trener opcjonalny)
- User "1" _-- "0.._" UserMembership; Membership "1" -- "0..\*" UserMembership (M:N z atrybutami)
- UserMembership "1" _-- "0.._" Payment (silna zależność)
- User "1" _-- "0.._" CheckIn (silna zależność)
- Equipment "1" _-- "0.._" Maintenance (silna zależność)

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

#### Przykładowe zapytania SQL (surowy kod)

1. Użytkownicy pogrupowani po roli (GROUP BY + COUNT):

SELECT roleId, COUNT(id) AS user_count
FROM [User]
GROUP BY roleId
ORDER BY user_count DESC;

```sql
SELECT userId, COUNT(id) AS checkin_count
FROM CheckIn
GROUP BY userId
HAVING COUNT(id) > 5
ORDER BY checkin_count DESC;
```

3. Użytkownicy bez żadnego wejścia (LEFT JOIN):

```sql
SELECT u.id, u.firstName, u.lastName, u.email, r.name AS roleName
FROM [User] u
LEFT JOIN CheckIn c ON c.userId = u.id
JOIN Role r ON u.roleId = r.id
WHERE c.id IS NULL
ORDER BY u.createdAt DESC;
```

4. Sprzęt z datą ostatniego przeglądu (CORRELATED SUBQUERY):

```sql
SELECT e.*, m.id AS maintenanceId, m.date, m.cost, m.description
FROM Equipment e
JOIN Maintenance m ON m.equipmentId = e.id
WHERE m.date = (
  SELECT MAX(m2.date)
  FROM Maintenance m2
  WHERE m2.equipmentId = e.id
)
ORDER BY e.id;
```

5. Użytkownicy z aktywnym członkostwem droższym niż średnia (UNCORRELATED SUBQUERY):

```sql
SELECT u.id, u.firstName, u.lastName, u.email, m.name, m.price
FROM UserMembership um
JOIN [User] u ON u.id = um.userId
JOIN Membership m ON m.id = um.membershipId
WHERE m.price > (SELECT AVG(price) FROM Membership)
  AND um.active = 1
ORDER BY m.price DESC;
```

6. Wyszukiwanie użytkowników po imieniu, nazwisku lub emailu (LIKE):

```sql
SELECT *
FROM [User]
WHERE firstName LIKE '%szukana%'
   OR lastName LIKE '%szukana%'
   OR email LIKE '%szukana%';
```

7. Wyszukiwanie sprzętu po nazwie lub kategorii (LIKE):

```sql
SELECT *
FROM Equipment
WHERE name LIKE '%szukana%'
   OR category LIKE '%szukana%';
```

8. Użytkownicy o roli TRAINER, ADMIN, RECEPTIONIST (IN + SUBQUERY):

```sql
SELECT *
FROM [User]
WHERE roleId IN (
  SELECT id FROM Role WHERE name IN ('TRAINER', 'ADMIN', 'RECEPTIONIST')
);
```

9. Użytkownicy z aktywnym członkostwem (EXISTS):

```sql
SELECT *
FROM [User] u
WHERE EXISTS (
  SELECT 1 FROM UserMembership um WHERE um.userId = u.id AND um.active = 1
);
```

10. Sprzęt droższy niż jakiekolwiek członkostwo (ANY):

```sql
SELECT *
FROM Equipment
WHERE purchasePrice > ANY (SELECT price FROM Membership);
```

11. Sprzęt droższy niż wszystkie członkostwa (ALL):

```sql
SELECT *
FROM Equipment
WHERE purchasePrice > ALL (SELECT price FROM Membership);
```

12. Lista wszystkich członkostw użytkownika:

```sql
SELECT m.*
FROM Membership m
JOIN UserMembership um ON um.membershipId = m.id
WHERE um.userId = @userId;
```

13. Lista wszystkich przeglądów sprzętu:

```sql
SELECT *
FROM Maintenance
WHERE equipmentId = @equipmentId
ORDER BY date DESC;
```

14. Lista wszystkich płatności użytkownika:

```sql
SELECT *
FROM Payment
WHERE userId = @userId
ORDER BY paymentDate DESC;
```

15. Lista wszystkich klas prowadzonych przez trenera:

```sql
SELECT *
FROM Class
WHERE trainerId = @trainerId
ORDER BY startTime DESC;
```

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

---

## 14. Dokumentacja API (PL)

Poniżej znajduje się dokumentacja najważniejszych endpointów API systemu siłowni. Każdy endpoint zawiera krótki opis, wymagane parametry oraz przykładową odpowiedź.

### Autoryzacja

#### POST `/api/auth/login`

**Opis:** Logowanie użytkownika.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "haslo"
}
```

**Przykładowa odpowiedź:**

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "MEMBER"
  }
}
```

#### POST `/api/auth/register`

**Opis:** Rejestracja nowego użytkownika.

**Body:**

```json
{
  "email": "nowy@example.com",
  "password": "haslo",
  "firstName": "Jan",
  "lastName": "Kowalski"
}
```

**Przykładowa odpowiedź:**

```json
{
  "id": 2,
  "email": "nowy@example.com",
  "role": "MEMBER"
}
```

#### POST `/api/auth/logout`

**Opis:** Wylogowanie użytkownika (wymaga tokena JWT).

**Przykładowa odpowiedź:**

```json
{
  "message": "Wylogowano pomyślnie."
}
```

---

### Użytkownicy

#### GET `/api/users`

**Opis:** Pobiera listę wszystkich użytkowników.

**Przykładowa odpowiedź:**

```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "role": "MEMBER"
  },
  {
    "id": 2,
    "email": "nowy@example.com",
    "firstName": "Anna",
    "lastName": "Nowak",
    "role": "TRAINER"
  }
]
```

#### GET `/api/users/{id}`

**Opis:** Pobiera szczegóły użytkownika o podanym ID.

**Przykładowa odpowiedź:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "role": "MEMBER",
  "phoneNumbers": ["123456789", "987654321"]
}
```

#### POST `/api/users`

**Opis:** Dodaje nowego użytkownika.

**Body:**

```json
{
  "email": "nowy@example.com",
  "password": "haslo",
  "firstName": "Anna",
  "lastName": "Nowak",
  "role": "MEMBER"
}
```

**Przykładowa odpowiedź:**

```json
{
  "id": 3,
  "email": "nowy@example.com",
  "role": "MEMBER"
}
```

---

### Członkostwa

#### GET `/api/memberships`

**Opis:** Pobiera listę dostępnych typów członkostw.

**Przykładowa odpowiedź:**

```json
[
  {
    "id": 1,
    "name": "Standard",
    "price": 99.99,
    "duration": 30
  },
  {
    "id": 2,
    "name": "Premium",
    "price": 149.99,
    "duration": 30
  }
]
```

#### POST `/api/memberships`

**Opis:** Dodaje nowy typ członkostwa.

**Body:**

```json
{
  "name": "VIP",
  "price": 199.99,
  "duration": 30
}
```

**Przykładowa odpowiedź:**

```json
{
  "id": 3,
  "name": "VIP",
  "price": 199.99,
  "duration": 30
}
```

---

### Zajęcia

#### GET `/api/classes`

**Opis:** Pobiera listę zajęć.

**Przykładowa odpowiedź:**

```json
[
  {
    "id": 1,
    "name": "Yoga",
    "trainerId": 2,
    "startTime": "2025-12-01T10:00:00Z",
    "duration": 60
  }
]
```

#### POST `/api/classes`

**Opis:** Dodaje nowe zajęcia.

**Body:**

```json
{
  "name": "Pilates",
  "trainerId": 2,
  "startTime": "2025-12-02T12:00:00Z",
  "duration": 60
}
```

**Przykładowa odpowiedź:**

```json
{
  "id": 2,
  "name": "Pilates",
  "trainerId": 2,
  "startTime": "2025-12-02T12:00:00Z",
  "duration": 60
}
```

---

### Sprzęt

#### GET `/api/equipment`

**Opis:** Pobiera listę sprzętu.

**Przykładowa odpowiedź:**

```json
[
  {
    "id": 1,
    "name": "Bieżnia",
    "purchaseDate": "2023-01-10",
    "purchasePrice": 5000.0
  }
]
```

#### POST `/api/equipment`

**Opis:** Dodaje nowy sprzęt.

**Body:**

```json
{
  "name": "Rower stacjonarny",
  "purchaseDate": "2023-02-15",
  "purchasePrice": 3000.0
}
```

**Przykładowa odpowiedź:**

```json
{
  "id": 2,
  "name": "Rower stacjonarny",
  "purchaseDate": "2023-02-15",
  "purchasePrice": 3000.0
}
```

---

### Płatności

#### GET `/api/payments`

**Opis:** Pobiera listę płatności użytkowników.

**Przykładowa odpowiedź:**

```json
[
  {
    "id": 1,
    "userMembershipId": 1,
    "amount": 99.99,
    "date": "2025-11-01"
  }
]
```

#### POST `/api/payments`

**Opis:** Dodaje nową płatność.

**Body:**

```json
{
  "userMembershipId": 1,
  "amount": 99.99,
  "date": "2025-11-01"
}
```

**Przykładowa odpowiedź:**

```json
{
  "id": 2,
  "userMembershipId": 1,
  "amount": 99.99,
  "date": "2025-11-01"
}
```

---

### Wejścia (Check-in)

#### GET `/api/checkins`

**Opis:** Pobiera listę wejść użytkowników na siłownię.

**Przykładowa odpowiedź:**

```json
[
  {
    "id": 1,
    "userId": 1,
    "checkInTime": "2025-11-28T08:00:00Z",
    "checkOutTime": null
  }
]
```

#### POST `/api/checkins`

**Opis:** Rejestruje nowe wejście użytkownika.

**Body:**

```json
{
  "userId": 1,
  "checkInTime": "2025-11-28T08:00:00Z"
}
```

**Przykładowa odpowiedź:**

```json
{
  "id": 2,
  "userId": 1,
  "checkInTime": "2025-11-28T08:00:00Z",
  "checkOutTime": null
}
```

---

### Pracownicy, trenerzy, recepcjoniści

#### GET `/api/employees`

**Opis:** Pobiera listę pracowników.

#### GET `/api/trainers`

**Opis:** Pobiera listę trenerów.

#### GET `/api/receptionists`

**Opis:** Pobiera listę recepcjonistów.

Przykładowe odpowiedzi analogiczne do użytkowników, z dodatkowymi polami specyficznymi dla danej roli.

---

**Uwaga:** Wszystkie endpointy wymagające autoryzacji muszą być wywoływane z nagłówkiem `Authorization: Bearer <token>`.
