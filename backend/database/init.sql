-- TABELA: Clients

IF OBJECT_ID('dbo.Clients', 'U') IS NOT NULL
    DROP TABLE dbo.Clients;
GO

CREATE TABLE dbo.Clients (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Document VARCHAR(20) NOT NULL,
    Name VARCHAR(60) NOT NULL,
    TradeName VARCHAR(100) NULL,
    Address VARCHAR(200) NULL
);
GO


-- TABELA: Products

IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL
    DROP TABLE dbo.Products;
GO

CREATE TABLE dbo.Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Barcode VARCHAR(14) NOT NULL,
    Description VARCHAR(60) NOT NULL,
    SaleValue DECIMAL(10,2) NOT NULL,
    GrossWeight DECIMAL(10,3) NOT NULL,
    NetWeight DECIMAL(10,3) NOT NULL
);
GO