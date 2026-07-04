-- AlterTable
ALTER TABLE `buyer_profiles` ADD COLUMN `deliveryAddress` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `deliveryAddress` VARCHAR(500) NULL;
