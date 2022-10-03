# Open_CIMT
 
## Overview
Connected Infrastructure Messaging Tool (CIMT) is a SaaS project providing a web frontend to setup geofenced work zones which are broadcast to connected vehicles following the SAE J2735 and US DOT 4.1 spec from encrypted roadside units.

Stake holders in this project are DriveOhio, City of Dublin Ohio, and City of Marysville Ohio

## Workflow
<img width="650" alt="image" src="https://user-images.githubusercontent.com/590535/193616836-bac5056e-f99c-4ae6-ab60-1b0779eeb55e.png">

- Traffic Management User will initially create the CIMT entry by entering details using the desktop or mobile applications.  Details include:
  - descriptve name (free text)
  - speed limit (mph)
  - direction of travel (22.5 degree increments)
  - are workers present?
  - shoulder closed?
  - start & send date times
  - messaging to motorists (ITIS codes builder)
  - service channel
  - broadcast region (geojson)
- Field User can subsequently update the CIMT entry details
  - lane details (gps coordinates)
  - scheduling
- Service uses the Connect:ITS REST API t build a UPER encoded TIM message
- (optionally if RSU signatures aren't available) Sericve uses an ISS REST to build the signature
- Service uses the CMCC REST API to install the UPER encodeded TIME message onto applicable RSUs of the broadcast region
- Users remove the CIMT entry once complete
  - Service and CMCC remove the UPER encoded TIM message from RSUs
  
## Authentication
Authentication and Identity services rely strictly upon approved Unified Access Management systems, namely: Microsoft Azure Active Directory (oAuth) or Google Cloud Platform (oAuth). Users are managed by their organizations allowing for password and MFA/2FA policies to be enforced. Offboarding is simple as users lose access to the system when they leave their place of employment. Additionally, this affords other protections as only a single password must be managed and no other user data is requested outside of their name, their email, and their token (returned by Microsoft or Google).
