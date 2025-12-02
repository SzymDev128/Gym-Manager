BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Role] (
    [roleId] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Role_pkey] PRIMARY KEY CLUSTERED ([roleId]),
    CONSTRAINT [Role_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [userId] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [firstName] NVARCHAR(1000) NOT NULL,
    [lastName] NVARCHAR(1000) NOT NULL,
    [birthDate] DATETIME2,
    [roleId] INT NOT NULL CONSTRAINT [User_roleId_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([userId]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[UserMembership] (
    [userMembershipId] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [membershipId] INT NOT NULL,
    [startDate] DATETIME2 NOT NULL CONSTRAINT [UserMembership_startDate_df] DEFAULT CURRENT_TIMESTAMP,
    [endDate] DATETIME2,
    [active] BIT NOT NULL CONSTRAINT [UserMembership_active_df] DEFAULT 1,
    CONSTRAINT [UserMembership_pkey] PRIMARY KEY CLUSTERED ([userMembershipId])
);

-- CreateTable
CREATE TABLE [dbo].[PhoneNumber] (
    [phoneNumberId] INT NOT NULL IDENTITY(1,1),
    [number] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    CONSTRAINT [PhoneNumber_pkey] PRIMARY KEY CLUSTERED ([phoneNumberId])
);

-- CreateTable
CREATE TABLE [dbo].[Membership] (
    [membershipId] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [durationMonths] INT NOT NULL,
    [price] FLOAT(53) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL CONSTRAINT [Membership_description_df] DEFAULT '',
    CONSTRAINT [Membership_pkey] PRIMARY KEY CLUSTERED ([membershipId])
);

-- CreateTable
CREATE TABLE [dbo].[Employee] (
    [employeeId] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [hireDate] DATETIME2 NOT NULL,
    [salary] FLOAT(53) NOT NULL,
    CONSTRAINT [Employee_pkey] PRIMARY KEY CLUSTERED ([employeeId]),
    CONSTRAINT [Employee_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[Trainer] (
    [trainerId] INT NOT NULL,
    [employeeId] INT NOT NULL,
    [specialization] NVARCHAR(1000) NOT NULL,
    [experienceYears] INT NOT NULL,
    [supervisorId] INT,
    CONSTRAINT [Trainer_pkey] PRIMARY KEY CLUSTERED ([trainerId]),
    CONSTRAINT [Trainer_employeeId_key] UNIQUE NONCLUSTERED ([employeeId])
);

-- CreateTable
CREATE TABLE [dbo].[Receptionist] (
    [receptionistId] INT NOT NULL,
    [employeeId] INT NOT NULL,
    [shiftHours] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Receptionist_pkey] PRIMARY KEY CLUSTERED ([receptionistId]),
    CONSTRAINT [Receptionist_employeeId_key] UNIQUE NONCLUSTERED ([employeeId])
);

-- CreateTable
CREATE TABLE [dbo].[Class] (
    [classId] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [startTime] DATETIME2 NOT NULL,
    [durationMin] INT NOT NULL,
    [trainerId] INT,
    CONSTRAINT [Class_pkey] PRIMARY KEY CLUSTERED ([classId])
);

-- CreateTable
CREATE TABLE [dbo].[Equipment] (
    [equipmentId] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000) NOT NULL,
    [condition] NVARCHAR(1000) NOT NULL,
    [purchaseDate] DATETIME2 NOT NULL,
    [purchasePrice] FLOAT(53) NOT NULL CONSTRAINT [Equipment_purchasePrice_df] DEFAULT 0,
    CONSTRAINT [Equipment_pkey] PRIMARY KEY CLUSTERED ([equipmentId])
);

-- CreateTable
CREATE TABLE [dbo].[Maintenance] (
    [maintenanceId] INT NOT NULL IDENTITY(1,1),
    [equipmentId] INT NOT NULL,
    [date] DATETIME2 NOT NULL,
    [cost] FLOAT(53) NOT NULL,
    [description] NVARCHAR(1000),
    CONSTRAINT [Maintenance_pkey] PRIMARY KEY CLUSTERED ([maintenanceId])
);

-- CreateTable
CREATE TABLE [dbo].[Payment] (
    [paymentId] INT NOT NULL IDENTITY(1,1),
    [userMembershipId] INT NOT NULL,
    [date] DATETIME2 NOT NULL CONSTRAINT [Payment_date_df] DEFAULT CURRENT_TIMESTAMP,
    [amount] FLOAT(53) NOT NULL,
    [method] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Payment_pkey] PRIMARY KEY CLUSTERED ([paymentId])
);

-- CreateTable
CREATE TABLE [dbo].[CheckIn] (
    [checkInId] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [checkInTime] DATETIME2 NOT NULL CONSTRAINT [CheckIn_checkInTime_df] DEFAULT CURRENT_TIMESTAMP,
    [checkOutTime] DATETIME2,
    CONSTRAINT [CheckIn_pkey] PRIMARY KEY CLUSTERED ([checkInId])
);

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([roleId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserMembership] ADD CONSTRAINT [UserMembership_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([userId]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserMembership] ADD CONSTRAINT [UserMembership_membershipId_fkey] FOREIGN KEY ([membershipId]) REFERENCES [dbo].[Membership]([membershipId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PhoneNumber] ADD CONSTRAINT [PhoneNumber_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([userId]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Employee] ADD CONSTRAINT [Employee_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([userId]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Trainer] ADD CONSTRAINT [Trainer_supervisorId_fkey] FOREIGN KEY ([supervisorId]) REFERENCES [dbo].[Trainer]([trainerId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Trainer] ADD CONSTRAINT [Trainer_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[Employee]([employeeId]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Receptionist] ADD CONSTRAINT [Receptionist_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[Employee]([employeeId]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Class] ADD CONSTRAINT [Class_trainerId_fkey] FOREIGN KEY ([trainerId]) REFERENCES [dbo].[Trainer]([trainerId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Maintenance] ADD CONSTRAINT [Maintenance_equipmentId_fkey] FOREIGN KEY ([equipmentId]) REFERENCES [dbo].[Equipment]([equipmentId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [Payment_userMembershipId_fkey] FOREIGN KEY ([userMembershipId]) REFERENCES [dbo].[UserMembership]([userMembershipId]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CheckIn] ADD CONSTRAINT [CheckIn_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([userId]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
