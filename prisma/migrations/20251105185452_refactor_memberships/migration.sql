/*
  Warnings:

  - You are about to drop the column `memberId` on the `CheckIn` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `CheckIn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userMembershipId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[CheckIn] DROP CONSTRAINT [CheckIn_memberId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Member] DROP CONSTRAINT [Member_membershipId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Member] DROP CONSTRAINT [Member_userId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Payment] DROP CONSTRAINT [Payment_memberId_fkey];

-- AlterTable
ALTER TABLE [dbo].[CheckIn] DROP COLUMN [memberId];
ALTER TABLE [dbo].[CheckIn] ADD [userId] INT NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Payment] DROP COLUMN [memberId];
ALTER TABLE [dbo].[Payment] ADD [userMembershipId] INT NOT NULL;

-- DropTable
DROP TABLE [dbo].[Member];

-- CreateTable
CREATE TABLE [dbo].[UserMembership] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [membershipId] INT NOT NULL,
    [startDate] DATETIME2 NOT NULL CONSTRAINT [UserMembership_startDate_df] DEFAULT CURRENT_TIMESTAMP,
    [endDate] DATETIME2,
    [active] BIT NOT NULL CONSTRAINT [UserMembership_active_df] DEFAULT 1,
    CONSTRAINT [UserMembership_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[UserMembership] ADD CONSTRAINT [UserMembership_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserMembership] ADD CONSTRAINT [UserMembership_membershipId_fkey] FOREIGN KEY ([membershipId]) REFERENCES [dbo].[Membership]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [Payment_userMembershipId_fkey] FOREIGN KEY ([userMembershipId]) REFERENCES [dbo].[UserMembership]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CheckIn] ADD CONSTRAINT [CheckIn_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
