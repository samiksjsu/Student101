insert into University(U_Name,U_State,U_City,U_Street,U_Zip)
values('San Jose State University','California','San Jose','San Fernando',95112);

insert into University(U_Name,U_State,U_City,U_Street,U_Zip)
values('Santa Clara University','California','San Jose','El Camino Real',95053);

insert into University(U_Name,U_State,U_City,U_Street,U_Zip)
values('University of Southern California','California','Los Angeles','W Jefferson Blvd',90007);




insert into Airport(Air_Code,Air_Name)
values('SFO','San Fransisco International Airport');

insert into Airport(Air_Code,Air_Name)
values('SJC','San Jose Inernational Airport');

insert into Airport(Air_Code,Air_Name)
values('LAX','Los Angeles International Airport');

insert into Airport(Air_Code,Air_Name)
values('ONT','Ontario International Airport');


insert into Terminal(T_Air_Code,T_Number)
values('LAX','1');
insert into Terminal(T_Air_Code,T_Number)
values('LAX','2');
insert into Terminal(T_Air_Code,T_Number)
values('LAX','3');
insert into Terminal(T_Air_Code,T_Number)
values('LAX','4');
insert into Terminal(T_Air_Code,T_Number)
values('LAX','5');
insert into Terminal(T_Air_Code,T_Number)
values('LAX','6');
insert into Terminal(T_Air_Code,T_Number)
values('LAX','7');


insert into Terminal(T_Air_Code,T_Number)
values('ONT','1');
insert into Terminal(T_Air_Code,T_Number)
values('ONT','2');
insert into Terminal(T_Air_Code,T_Number)
values('ONT','3');
insert into Terminal(T_Air_Code,T_Number)
values('ONT','4');
insert into Terminal(T_Air_Code,T_Number)
values('ONT','5');
insert into Terminal(T_Air_Code,T_Number)
values('ONT','6');
insert into Terminal(T_Air_Code,T_Number)
values('ONT','7');

insert into Terminal(T_Air_Code,T_Number)
values('SFO','1');
insert into Terminal(T_Air_Code,T_Number)
values('SFO','2');
insert into Terminal(T_Air_Code,T_Number)
values('SFO','3');
insert into Terminal(T_Air_Code,T_Number)
values('SFO','4');
insert into Terminal(T_Air_Code,T_Number)
values('SFO','5');

insert into Terminal(T_Air_Code,T_Number)
values('SJC','1');
insert into Terminal(T_Air_Code,T_Number)
values('SJC','2');
insert into Terminal(T_Air_Code,T_Number)
values('SJC','3');
insert into Terminal(T_Air_Code,T_Number)
values('SJC','4');
insert into Terminal(T_Air_Code,T_Number)
values('SJC','5');

insert into Nearby_Airports(N_U_Id,N_A_Code)
values(1,'SJC');
insert into Nearby_Airports(N_U_Id,N_A_Code)
values(1,'SFO');
insert into Nearby_Airports(N_U_Id,N_A_Code)
values(2,'SJC');
insert into Nearby_Airports(N_U_Id,N_A_Code)
values(2,'SFO');


insert into Nearby_Airports(N_U_Id,N_A_Code)
values(3,'LAX');
insert into Nearby_Airports(N_U_Id,N_A_Code)
values(3,'ONT');


insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(1,'101 San Fernando','https://www.essexapartmenthomes.com/california/san-francisco-bay-area-apartments/san-jose-apartments/101-san-fernando',0.2,
'San Fernando Street','San Jose','California','95112');

insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(1,'Avalon at Cahil Park','https://www.avaloncommunities.com/california/san-jose-apartments/avalon-at-cahill-park?utm_source=google&utm_medium=gmb&utm_campaign=gmblist',1.4,
'754 The Alameda','San Jose','California','95126');

insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(1,'Avalon on the Alameda','https://www.avaloncommunities.com/california/san-jose-apartments/avalon-on-the-alameda?utm_source=google&utm_medium=gmb&utm_campaign=gmblist',1.9,
'1300 The Alameda','San Jose','California','95126');

insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(1,'Villa Torino','https://www.villatorinoapts.com/#',1.0,
'29 W Julian St','San Jose','California','95110');

insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(1,'One South Market','https://www.essexapartmenthomes.com/california/san-francisco-bay-area-apartments/san-jose-apartments/one-south-market',0.6,
'1 S Market St #100','San Jose','California','95113');

insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(1,'Foundry Commons','https://www.foundrycommons.com/',0.7,
'868 S 5th St','San Jose','California','95112');

insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(2,'Modera the Alameda','https://www.moderathealameda.com/?utm_source=GMB&utm_medium=organic&utm_campaign=Local',2.3,
'787 The Alameda','San Jose','California','95126');

insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(2,'Domicilio Apartments','https://www.domicilioapts.com/',0.2,
'431 El Camino Real','Santa Clara','California','95050');

insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(2,'Lincoln Park Apartments ','https://www.wres.com/',1.1,
'1601 Santa Clara St','Santa Clara','California','95050');


insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(2,'Park Central','https://prometheusapartments.com/ca/santa-clara-apartments/park-central/',0.6,
'1050 Benton St','Santa Clara','California','95050');


insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(2,'Normandy Park','http://www.normandyparksantaclara.com/',0.6,
'48 Washington St','Santa Clara','California','95050');



insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(3,'Mardi Gras Apartments','https://www.apartments.com/mardi-gras-apartments-los-angeles-ca/9y41wl5/',0.5,
'720 W 27th St','Los Angeles','California','90007');

insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(3,'City Park Apartments','https://www.apartments.com/city-park-apartments-los-angeles-ca/hx8k4z2/',0.3,
'1246 W 30th St','Los Angeles','California','90007');

insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(3,'Pacific Electric Lofts','https://www.essexapartmenthomes.com/california/los-angeles-area-apartments/los-angeles-apartments/pe-lofts',3.0,
'610 S Main St','Los Angeles','California','90014');

insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(3,'E On Grand','https://www.eongrandla.com/',2.5,
'1249 S Grand Ave','Los Angeles','California','90015');

insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(3,'WREN Apartments','https://livewren.com/?utm_source=apartmentseo&utm_medium=gmb&utm_campaign=organicmaplisting',2.0,
'1230 S Olive St','Los Angeles','California','90015');

insert into Apartment(A_U_Id,A_Name,A_Website,A_Distance,A_Street,A_City,A_State,A_Zip)
values(3,'Met Lofts','https://www.berkshirecommunities.com/apartments/ca/los-angeles/met-lofts/',2.3,
'1050 Flower St','Los Angeles','California','90015');