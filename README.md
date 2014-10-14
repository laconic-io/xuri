#Scheme based URI parser

## About

xuri is a function that parses a uri into an object based on its scheme.

xuri(uri [,scheme]);

``` 
object = xuri(uri string [, scheme string]);
```
####Params
uri = string to be f
scheme = optional scheme to be specified


``` javascript
// call uri to be parsed
var uri = xuri('https://sub.github.com/laconic/io?par1=abc&par2=def');

// output
uri.uri           //  'https://sub.github.com/laconic/io?par1=abc&par2=def';
uri.scheme        //  'https';
uri.hierarchical  //  '//sub.github.com/laconic/io';
uri.authority     //  '//sub.github.com/';
uri.host          //  'sub.github.com';
uri.hostname      //  'sub.github.com';
uri.hostformat    //  'domain';                 (either 'domain'||'ipv4'||'ipv6')
uri.domains       //  ['com','github','sub'];   (top level domain is first [0])
uri.site          //  'github.com';             (top level domain and domain)
uri.path          //  '/laconic/io';
uri.query         //  'par1=abc&par2=def';
uri.params        //  {'par1':'abc','par2':'def'}
```
Below is the formats for all the schemes the function can interpret. If the scheme is not recocgnized it will attempt to be interpreted by the http standard.


### Full scheme formats

##### URI Universal components
First each URI is broken down into these minimum 4 components:
```
<scheme> : <hierarchical> [ ? <query> ] [ # <fragment> ]
```
Then the components are broken down further depending on URI.

====
##### http, https, ws, wss, ftp, ftps, nfs, (default if scheme not recognized)
``` 
  http://username:password@sub.domain.tld:8888/path/to.html?a=hi&b=to&c=you#anchorht
      | |        |        |              |    |            |               |        |
      | |        |        |   |---site---|    |            |               |        |
      | |        |        |              |    |            |               |        |
      | |--user--|password|--domains[]*--|    |            |               |        |
      | |                 |              |    |            |               |        |
      | |                 |---hostname---|port|            |               |        |
      | |                 |                   |            |               |        |
      | |----userinfo-----|--------host-------|            |               |        |
      |                                       |            |               |        |
      |--------------authority----------------|----path----|---params{}----|        |
  	  |                                                    |               |        |
scheme|------------------hierarchical----------------------|-----query-----|fragment|


hostformat = 'ipv4'||'ipv6'||'domain' // depends on hostname (not listed above)

*domains = ['tld', 'domain', 'sub']; // tld first to sub || right to left
```

====
##### mailto
```
mailto://one@domain.com,two@domain.com?subject=hello&cc=another@domain.com
      |                               |                                   |
      |---------addresses[]-----------|-------------params{}--------------|
      |                               |                                   |
scheme|---------hierarchical----------|--------------query----------------|
```

====
##### tel, fax, modem (fax & modem are historical)
```
   tel:+1-555-438-3732
      |               |
      |--phonenumber--|
      |               |
scheme|-hierarchical--|
```

====
##### sms
```
   sms:+1-555-438-3732,+1-555-438-5678?body=hello%20there
      |                               |                  |
      |--------phonenumbers[]---------|----params{}------|
      |                               |                  |
scheme|---------hierarchical----------|------query-------|
```

##### geo
```
   geo:137.786971,-122.399677,1234;crs=Moon-2011;u=35
      |          |           |    |             |    |   
      |-latitude-|-longitude-|alt*|-----crs-----|-u--|
      |                                              |
scheme|---------hierarchical-------------------------|
*alt is "altitude" key
```

====
#### maps
```
  maps:q=1234+something+lane+ca
      | |                      |
      | |---------q------------|
      |                        |
scheme|-----hierarchical-------|
```

====
#### ssh
```
   ssh:username;fingerprint=<fingerprint>@123.12.12.24:8888
      |        |                         |            |    |
      |        |                         |--hostname--|port|
      |        |                         |                 |
      |--user--|-------fingerprint-------|------host-------|
      |                                                    |
scheme|--------------------hierarchical--------------------|
      
hostformat = 'ipv4'||'ipv6'||'domain' // depends on hostname (not listed above)
```

====
#### dns
```
   dns://192.168.1.1:8888/ftp.example.org?type=A;class=IN
      | |           |    |               |               |
      | |-hostname--|port|---dnsname-----|----params{}---|
      | |                |               |               |
      | |------host------|               |               |
      |                                  |               |
scheme|-----------hierarchical-----------|-----query-----|

hostformat = 'ipv4'||'ipv6'||'domain' // depends on hostname (not listed above)
```

====
#### file
```
  file://localhost/etc/apache2/apache2.cnf
      | |                                 |
      | |---host--|--------path-----------|
      |                                   |
scheme|-----------hierarchical------------|
```
