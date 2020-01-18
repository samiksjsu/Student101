create table University
(U_Id int AUTO_INCREMENT primary key,
U_Name varchar(100) unique,
U_State varchar (50) not null,
U_City varchar(50) not null,
U_Street varchar (50) not null,
U_Zip int not null
);

create table Student (
S_Id varchar(10) primary key,
S_Name varchar (50) not null,
S_Email varchar (500) not null,
S_Password varchar(5000) not null,
S_Phone BigInt not null unique,
S_University int not null,
foreign key (S_University) references University(U_Id)
);

create table Ride_Provider(
P_Drivers_License varchar (10) primary key,
P_Password varchar(5000) not null,
P_Name varchar (50) not null,
P_Phone BigInt not null unique,
P_Email varchar (500) unique not null,
P_University int not null,
foreign key (P_University) references University(U_Id)
);

create table Airport (
Air_Code varchar (4) primary key,
Air_Name varchar (50) unique not null
);

create table Terminal (
T_Air_code varchar (4) not null,
T_Number varchar (4) not null,
primary key (T_Air_code, T_Number),
foreign key (T_Air_code) references Airport(Air_Code)
);

create table Apartment(
A_U_Id int not null,
A_Website varchar(2000),
A_Name varchar(50) not null,
A_Distance float not null,
A_Street varchar(50) not null,
A_City varchar (50) not null,
A_State varchar (50) not null,
A_Zip int not null,
primary key (A_U_Id, A_Name),
foreign key (A_U_Id) references University(U_Id)
);

create table Ammenities (
A_U_Id int not null,
A_Name varchar(50) not null ,
A_Ammenities varchar (50) not null,
foreign key (A_U_Id, A_Name) references Apartment(A_U_Id, A_Name)
);

create table Ride(
R_Id int AUTO_INCREMENT PRIMARY KEY,
R_Date date not null,
R_Time time not null,
R_Rating float,
R_Starting_Air_Code varchar(4) not null,
R_Starting_Terminal varchar (4) not null,
foreign key (R_Starting_Air_Code, R_Starting_Terminal) references Terminal (T_Air_code, T_Number),
R_Accepted_By varchar(10),
R_Current int,
R_Total int,
foreign key (R_Accepted_By) references Ride_Provider(P_Drivers_License)
);

create table Nearby_Airports(
N_U_Id int,
N_A_Code varchar(4),
primary key (N_U_Id, N_A_Code),
foreign key (N_U_Id) references University(U_Id),
foreign key (N_A_Code) references Airport(Air_Code)
);

create table Student_Ride_Availed (
SRA_S_Id varchar(10),
SRA_Ride_Id int,
SRA_Rating float,
primary key (SRA_S_Id, SRA_Ride_Id),
foreign key (SRA_S_Id) references Student(S_Id),
foreign key (SRA_Ride_Id) references Ride(R_Id)
);

create table Student_Arriving_Terminal(
SAT_S_Id varchar(10),
SAT_Air_Code varchar(4) not null,
SAT_T_Number varchar(4) not null,
SAT_Date date not null,
SAt_Time time not null,
foreign key (SAT_S_Id) references Student(S_Id),
foreign key (SAT_Air_Code, SAT_T_Number) references Terminal(T_Air_Code, T_Number)
);



create table Ride_Address(
RA_Id int AUTO_INCREMENT PRIMARY KEY,
RA_S_Id varchar(10),
RA_R_Id int,
RA_Street varchar(50) not null,
RA_City varchar (50) not null,
RA_State varchar (50) not null,
RA_Zip int not null,
foreign key (RA_S_Id) references Student(S_Id),
foreign key (RA_R_Id) references Ride(R_Id)
);


create table Rides_Requested_By_Student (
RRBS_Id int auto_increment primary key,
RRBS_S_Id varchar(10),
RRBS_Date date not null,
RRBS_Time time not null,
RRBS_Air_Code varchar(4) not null,
RRBS_T_Number varchar(4) not null,
RRBS_Seats int not null,
RRBS_Street varchar(50) not null,
RRBS_City varchar(50) not null,
RRBS_State varchar(50) not null,
RRBS_Zip int not null,
foreign key (RRBS_Air_Code, RRBS_T_Number) references Terminal(T_Air_Code, T_Number),
foreign key (RRBS_S_Id) references Student(S_Id)
);

create table Rides_Posted_By_Provider (
RPBP_Id int auto_increment primary key,
RPBP_Drivers_License varchar(10) not null,
RPBP_Date date not null,
RPBP_Time time not null,
RPBP_From varchar(4) not null,
RPBP_Current int default 0,
RPBP_Total int not null,
foreign key (RPBP_Drivers_License) references Ride_Provider(P_Drivers_License),
foreign key (RPBP_From) references Airport(Air_Code)
);

create table Student_Tokens (
ST_S_Email varchar (500),
ST_Token varchar (5000)
)

create table Ride_Provider_Tokens (
RPT_P_Email varchar (500),
RPT_Token varchar (5000)
)