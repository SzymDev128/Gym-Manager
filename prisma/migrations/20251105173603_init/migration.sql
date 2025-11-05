BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Role] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Role_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Role_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [firstName] NVARCHAR(1000) NOT NULL,
    [lastName] NVARCHAR(1000) NOT NULL,
    [birthDate] DATETIME2,
    [roleId] INT NOT NULL CONSTRAINT [User_roleId_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Member] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [joinDate] DATETIME2 NOT NULL CONSTRAINT [Member_joinDate_df] DEFAULT CURRENT_TIMESTAMP,
    [membershipId] INT NOT NULL,
    CONSTRAINT [Member_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Member_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[PhoneNumber] (
    [id] INT NOT NULL IDENTITY(1,1),
    [number] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    CONSTRAINT [PhoneNumber_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Membership] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [durationMonths] INT NOT NULL,
    [price] FLOAT(53) NOT NULL,
    CONSTRAINT [Membership_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Employee] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [hireDate] DATETIME2 NOT NULL,
    [salary] FLOAT(53) NOT NULL,
    CONSTRAINT [Employee_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Employee_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[Trainer] (
    [id] INT NOT NULL,
    [specialization] NVARCHAR(1000) NOT NULL,
    [experienceYears] INT NOT NULL,
    [supervisorId] INT,
    CONSTRAINT [Trainer_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Receptionist] (
    [id] INT NOT NULL,
    [shiftHours] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Receptionist_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Class] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [startTime] DATETIME2 NOT NULL,
    [durationMin] INT NOT NULL,
    [trainerId] INT,
    CONSTRAINT [Class_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Equipment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000) NOT NULL,
    [condition] NVARCHAR(1000) NOT NULL,
    [purchaseDate] DATETIME2 NOT NULL,
    CONSTRAINT [Equipment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Maintenance] (
    [id] INT NOT NULL IDENTITY(1,1),
    [equipmentId] INT NOT NULL,
    [date] DATETIME2 NOT NULL,
    [cost] FLOAT(53) NOT NULL,
    [description] NVARCHAR(1000),
    CONSTRAINT [Maintenance_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Payment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [memberId] INT NOT NULL,
    [date] DATETIME2 NOT NULL CONSTRAINT [Payment_date_df] DEFAULT CURRENT_TIMESTAMP,
    [amount] FLOAT(53) NOT NULL,
    [method] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Payment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[CheckIn] (
    [id] INT NOT NULL IDENTITY(1,1),
    [memberId] INT NOT NULL,
    [checkInTime] DATETIME2 NOT NULL CONSTRAINT [CheckIn_checkInTime_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [CheckIn_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Member] ADD CONSTRAINT [Member_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Member] ADD CONSTRAINT [Member_membershipId_fkey] FOREIGN KEY ([membershipId]) REFERENCES [dbo].[Membership]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PhoneNumber] ADD CONSTRAINT [PhoneNumber_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Employee] ADD CONSTRAINT [Employee_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Trainer] ADD CONSTRAINT [Trainer_supervisorId_fkey] FOREIGN KEY ([supervisorId]) REFERENCES [dbo].[Trainer]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Trainer] ADD CONSTRAINT [Trainer_id_fkey] FOREIGN KEY ([id]) REFERENCES [dbo].[Employee]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Receptionist] ADD CONSTRAINT [Receptionist_id_fkey] FOREIGN KEY ([id]) REFERENCES [dbo].[Employee]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Class] ADD CONSTRAINT [Class_trainerId_fkey] FOREIGN KEY ([trainerId]) REFERENCES [dbo].[Trainer]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Maintenance] ADD CONSTRAINT [Maintenance_equipmentId_fkey] FOREIGN KEY ([equipmentId]) REFERENCES [dbo].[Equipment]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [Payment_memberId_fkey] FOREIGN KEY ([memberId]) REFERENCES [dbo].[Member]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CheckIn] ADD CONSTRAINT [CheckIn_memberId_fkey] FOREIGN KEY ([memberId]) REFERENCES [dbo].[Member]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
