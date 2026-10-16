---
title: "Gretio Common Terms & Glossary"
date: 2021-06-15T21:18:18.000Z
updated: 2022-05-21T22:10:11.000Z
excerpt: "ABS Module – Has been replaced by the EBCM. Modern ABS systems are highly integrated into traction control systems. Air Bag Module – Refers to actual air bag component. These are non-serviceable and must be replaced. Diagnostics are done through a separate module known as the SDM or IRSDM. AUTOSAR..."
---

**ABS Module –** Has been replaced by the EBCM. Modern ABS systems are highly integrated into traction control systems.

**Air Bag Module –** Refers to actual air bag component. These are non-serviceable and must be replaced. Diagnostics are done through a separate module known as the SDM or IRSDM.

**AUTOSAR –** Set of standards for automotive software architecture.

**BCM –** Body Control Module

**BroadR-Reach –** Absorbed by IEEE Standardized T100BASE-T1

**Control Function –** Some command you give to a control module which the control module then full-fills. This could be anything from increasing idle speed to programming certain information.

**CAN –** Controller Area Network. Network Standard which all automotive computers have used since early 2000s.

**CAN-FD** – Faster CAN which is incompatible with prior standards. Set to gradually replace CAN after 2022.

**CCM –** Chassis control module

**Control Module –** Most computers on a vehicle will be network addressable and will generally be referred to as control modules. In short. It just means it’s a computer.

**DoIP –** Diagnostic over IP. Newer diagnostic architecture which uses TCP sockets instead of CAN. Generally found on OBD2 port but may also be nonstandard supplemental connector.

**DPF –** Diesel particulate filter. An emissions component present on all vehicles manufactured after 2007.

**ECM –** Engine Control Module

**ECU –** Electronic Control Unit or Engine Control Unit. Generally, refers to the ECM but is many times used ambiguously. You should always re

**EBCM –** Electronic Brake Control Module

**EFI –** Electronic fuel injection. Outdated term as most modern ICE are EFI.

**HPCM –** Hybrid Powertrain Control Module, also used for EV (non hybrid).

**ICCM –** Instrument Cluster Control Module. Many times referred to as the IPC (Instrument Panel Cluster).

**IRSDM –** Inflatable restrain sensing and detection module.

**MDI –** This is an interface used by gm dealerships to connect to vehicles on Global A vehicles. MDI2 supports Global B vehicles.

**NOx –** Catch all for any Nitrogen bound to a number of oxygens. This is a harmful exhaust product and is produced by both gas engines and diesel engines.

**OBD2 –** A standardized port required by law to be present on all vehicles (electric, gas, diesel, etc...).

**PCM –** Not well defined. Generally, refers to a TCM+ECM combo unit.

**PID –** Parameter ID. Data you can view from a control module.

**RPO –** Regular production option. GM codes for features. Usually a short string of text (i.e. LML).

**SCR –** Selective Catalytic Reduction. A second emissions component introduced around 2010. Uses ammonia (from a Urea solution) to reduced nitrogen oxides (NOx ie NO, NO2, etc...) to less harmful components already found in the atmosphere (N2, and Water).

**SDM –** See IRSDM.

**SDGM –** Serial data gateway control module. This was introduced to help isolate some key modules from internet facing control modules (i.e. OnStar systems, radio, bluetooth connectivity modules). Most GM models after 2017 will have a gateway module.

**Subnet –** Modern vehicles use different networks across different protocols (TCP/IP, CAN, SWCAN, CAN-FD, MOST, LIN, etc...) Sometimes these networks are separated by a gateway and sometimes they may operate independently. Gretio calls all of these networks a 'Subnet’ whereas all networks on the vehicle are considered a single 'Network’.

For example most Global A Vehicles have the following Subnets:

-   Primary, HSCAN, GMLAN: General Purpose CAN, used for OBD2.
-   SWCAN or Low Speed GMLAN: Secondary CAN used for modules that don’t need a full CAN (SRS, DIC, RADIO, etc..)
-   Gateway Secured HSCAN: Same as Main CAN but secured by a gateway and not accessible over OBD2. Exactly what is on this subnet varies by year.
-   Powertrain Expansion Bus, Hybrid Expansion Bus: Secondary CAN networks used for specific functions. Generally, not accessible over OBD2.
-   MOST (Media Oriented Serial Transport) or Ethernet for Infotainment
-   Misc LIN busses

Global B Vehicles use a DCM (Diagnostic Control Module) which is many times simply the gateway. This module negotiates to all other networks on the vehicle. OBD2 communication with the DCM is done with a dedicated Ethernet or CAN connection.

**SIR –** Supplemental inflatable restraint system. See IRSDM.

**SPS –** Service programming procedure. GM tool used for programming and configuring control modules. Found in Techline Connect.

**T100BASE-T1, T10BASE-T1, and T1000BASE-T1:** Automotive Ethernet Standards for Physical Layer

**TCM –** Transmission Control Module

**Techline Connect –** GM service software which contains SPS, GDS2, and other information. Replaced legacy systems.

**Tech 2 –** GM OEM Tool used to service older pre–Global A vehicles (before 2012).

**UDS –** Unified Diagnostic Protocol. Loose standard for advanced diagnostic and management of automotive control modules. Can be found on CAN (UDS over CAN), CAN-FD (UDS over CAN-FD), or ethernet (UDS over Ethernet/TCP/IP).

**VIN –** Vehicle Identification Number.
