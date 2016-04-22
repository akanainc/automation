# Akana Automated Software Deployment
![Installer](images/header.png)

## Copyright
Copyright &copy; 2016 Akana, Inc. All Rights Reserved.

## Trademarks
All product and company names herein may be trademarks of their registered owners.
Akana, SOA Software, Community Manager, API Gateway, Lifecycle Manager, OAuth Server, Policy Manager, and Cloud 
Integration Gateway are trademarks of Akana, Inc.

## Akana, Inc.
Akana, Inc.
12100 Wilshire Blvd, Suite 1800
Los Angeles, CA 90025
(866) SOA-9876
www.akana.com
info@akana.com

## Disclaimer
The information provided in this document is provided “AS IS” WITHOUT ANY WARRANTIES OF ANY KIND INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT OF INTELLECTUAL PROPERTY. Akana may make changes to this document at any time without notice. All comparisons, functionalities and measures as related to similar products and services offered by other vendors are based on Akana’s internal assessment and/or publicly available information of Akana and other vendor product features, unless otherwise specifically stated. Reliance by you on these assessments / comparative assessments is to be made solely on your own discretion and at your own risk. The content of this document may be out of date, and Akana makes no commitment to update this content. This document may refer to products, programs or services that are not available in your country. Consult your local Akana business contact for information regarding the products, programs and services that may be available to you. Applicable law may not allow the exclusion of implied warranties, so the above exclusion may not apply to you.

## Installer Script
The installer script is used manily to install the product.  At the time of installation, the installer script can create (`-c`) containers by invoking the container script below.

To run installer:

* Download and copy the appropriate files to intended server (`/opt/akana_sw/stage/install`)
* cd \<extracted location\>/install
* Extract `ps-automation.\<version\>.zip` somewhere (`unzip ps-automation.\<version\>.zip`)
* vi (or favorite editor) `properties/installer.properties`
* Update as needed
    * resources
    * features
* add appropriate environment and container property files to properties directory
* run `./installer.py -i -s -c > createContainers.log`

All valid options are:

* `-i` install
* `-u` Update with new jar features
* `-p` Environment Properties file to use
* `-s` deploy scripts
* `-c` create containers
* `--hostname=<hostname>`
* `--timeout=<timeout>`
* `--name=<container name>`
* `--key=<container key>`
* `--filepath` Path to the zip file that needs to be extracted
* `--installpath` Path to the installation
* `--deployFiles` is an archive file that contains any extra files to be added to a containers deploy directory
* `--overwrite` is the option that will tell the installer to overwrite a directory that already exists.
* `--repository` is an option to be used when the lib directory is outside of the product home.  This is useful if using a shared location, mounted drive.
* `--javaopts` allows the script to override the default java options used at container startup.

## Container Script
The container script is only responsible for creating containers.  It will create however many container property files  exist in the property directory.  Container property files are any property file that doesn't contain the name `environment` or `default` in it.

The `environment.property` file is also required in the property directory.  This file will only exist once per server, no matter how many containers are being built on this image.

To run container as standalone:

* `cd <install dir>/sm8/scripts/Lib/soa/automation/properties`
* Update all property files correctly.  Delete the ones you don't want to create.
* `cd <install dir>/sm8/bin`
* run `./jython.sh ../scripts/Lib/soa/automation/containerManager.py -c > createContainers.log`

All valid options are:

* `-c` create containers
* `-u` update containers
* `-a` Add feature to existing container
* `-d` Delete container(s) from the PM console
* `--hostname=<hostname>`
* `--timeout=<timeout>`
* `--name=<container name>`
* `--key=<container key>`
* `--administrator` Administrator user for the console
* `--password` Password for the administrator user
* `--product` Which products containers should be deleted, defaults to 'PM'.  Valid values are: 'PM', 'CM', 'ND'
* `--version` Version of the containers.  Required when using the --product flag
* `--deployFiles` is an archive file that contains any extra files to be added to a containers deploy directory
    
### Logging
The Database and Container creation takes advantage of using a python logger [Python Logging](https://docs.python.org/2/library/logging.html).  
The log settings are as follows:

* CRITICAL
* ERROR
* WARN
* INFO
* DEBUG

The databaseLogger is defaulted to CRITICAL and the containerLogger is defaulted to only print messages at the ERROR level and above.  These are configured a property file named logging.config which is located in the properties directory of the installer.  You can lower the verbose settings of the logger by changing the level setting for the appropriate logger.

For instance, if you were creating a new database and did not want to see all of the statements but wanted to see informational messages, you would change the databaseLogger level to INFO.  But, if there is an issue, you could set 
this level to DEBUG and see all of the SQL statements as they are being ran.

### Delete Container

This feature allows a container to automatically be removed based off of a container key.  This function would be used to remove containers after an update containers has been added into the cluster or a de-scaling activity.  

This feature is invoked with the following steps:

* cd \<install dir\>/sm8/bin
* run ./jython.sh ../scripts/Lib/soa/automation/containerManager.py -d --hostname=\<PM hostname\> --administrator=\<Administrator to PM console\> --password=\<Administrator password\> --product=\<products, like PM\> --version=\<version of product, like 7.2.14\> --key=\<container key\> | tee /tmp/deleteContainer.log
    * `./jython.sh ../scripts/Lib/soa/automation/containerManager.py -d --hostname=https://awspm:9900 --administrator=admin --password=password --products=PM --version=7.2.14 --key=automatedPM_7214 | tee /tmp/deleteContainer.log`

This can be ran from any container in the environment.

   
## Property Files

### Installer Property File

```
    #InstallSection
    # install.path and resources.location must be absolute
    install.path=/opt/akana_sw/
    resources.location=/opt/akana_sw/stage/resources/
    features=<Update with all desired add on features>
```

if instaling multiple feature packs, the features properties would look like:

```
	features=akana-platform-8.1.39.zip,akana-pm-8.0.115.zip,akana-apiportal-8.0.0.291.zip,com.akana.devservices_8.0.0.zip,com.akana.integration.services_8.0.189684.zip,com.akana.activity.freemarker_8.0.0.zip,com.akana.activity.headers_8.0.0.zip,com.akana.activity.normalize_8.0.0.zip,com.soa.security.provider.siteminder_8.0.189684.zip,PolicyManagerForDataPower_8.0.0.zip
```

### Environment Property File
A single environment property file is required for a given environment build out.  These are properties that will be shared across all containers that exist in a given environment.

#### Build Database
The _Create Container_ process can also build the Policy Manager and Community Manager database. This processing is controlled by the properties in the `[DatabaseSection]` part of the _Environment Property File_ shown below.

The scripted database build process is divided into two parts just like the database processing in the Admin Console:

1. **Database Create Task** is the equivalent of the "Create new database" option in Admin console. If the database 
already exists, it will be replaced with a new, empty database.
2. **Schema Management Task** populates the database with the tables and data needed by the selected features.

The database build process scans all of the OSGi bundles in the `sm70/lib` directory tree to locate the scripts and controls needed by these two tasks. It does not depend on anything in the `sm70/dbscripts` directory tree.
 
The database build Jython scripts included in the Automated Deployment package are designed so they can be easily used in the future to provide additional automation such as:

* Changing the database connect string or username and password
* Applying database updates
* Installing additional features in a container that include database script

Database configuration works in the following manner:

* database.configure=true -- Database process is called, if configuration is needed the following properties are used:
 * database.create=true and database.recreate=true -- Call DatabaseCreate Task & delete/recreate DB if it exists
 * database.create=true and database.recreate=false -- Call DatabaseCreate Task & fail if database exists
 * database.create=false -- Do not call DatabaseCreate Task
* database.configure=false -- Database process is bypassed

Database scripts can be completely script.  This will allow the configuration of the database configuration file, but it will ignore any upgrade scripts that are found.  If this feature is desired, add `database.run.dbscripts=false` into the environment.properties file.  This is an optional property and is not required to exist in the property file.  This will default to true if it does not exist.

The following schema's can be installed into a database:

* pm
* cm
* oauth
* laas
* upgrade52
* pmdp
* wcf
* ims

Specify the configuration values for this database

| key          | restrict | description                                      |
| ------------ | -------- | ------------------------------------------------ |
| databaseType |          | 'mssql', 'mysql', 'oracle', 'oracle-sn', 'db2'   |
| user         |          | Database connect userid                          |
| password     |          | Plain-text password for that user                |
| server       |          | Database host name                               |
| port         |          | Database port                                    |
| database     |          | Name of the database (tablespace for oracle*)    |
| instance     | mssql    | MS SQL Server "instance name"				     |
| instanceName | oracle*  | Oracle SID or Service Name (for oracle-sn)	     |
| tablespace   | db2      | DB/2 Table Space name						     |
| bufferName   | db2      | DB/2 Buffer Pool							     |
| isNewBuffer  | db2      | flag to create a new Buffer Pool			     |
| maxPoolSize  |          | Maximum number of database connections		     |
| minPoolSize  |          | Minimum number of open, idle connections	     |
| maxWait      |          | Maximum time to wait for an available connection |

#### Configure MongoDB
MongoDB configuration is required when the feature `Akana MongoDB Support' (mongo.db) has been installed into the Policy 
Manager container.  Mongo configuration is accomplished by using the environment.properties file.  Populate the 
following fields with the correct values:
  
```
    #Mongo DB Configuration
    mongodb.thread=20
    mongodb.enabled=false
    mongodb.host=
    mongodb.port=
    mongodb.password=
    mongodb.username=
```

#### Property File

```
    #InstallSection
    install.path=/opt/akana_sw/
    
    #DatabaseSection
    database.create=false
    # if database create and the database already exist, what should we do
    database.recreate=false
    # Should the scripts run any needed dbscripts
    database.run.dbscripts=true
    # Check the required schemas
    database.pm=true
    database.cm=true
    database.oauth=true
    database.laas=false
    database.upgrade52=false
    database.pmdp=false
    database.wcf=false
    database.ims=false
    #   Specify the configuration values for this database
    #       key       |restrict | description         
    #   -------------+---------+--------------------------------------------------
    #   databaseType |         | 'mssql', 'mysql', 'oracle', 'oracle-sn', 'db2'
    #   user         |         | Database connect userid
    #   password     |         | Plain-text password for that user
    #   server       |         | Database host name
    #   port         |         | Database port
    #   database     |         | Name of the database (tablespace for oracle*)
    #   instance     | mssql   | MS SQL Server "instance name"
    #   instanceName | oracle* | Oracle SID or Service Name (for oracle-sn)
    #   tablespace   | db2     | DB/2 Table Space name
    #   bufferName   | db2     | DB/2 Buffer Pool
    #   isNewBuffer  | db2     | flag to create a new Buffer Pool
    #   maxPoolSize  |         | Maximum number of database connections
    #   minPoolSize  |         | Minimum number of open, idle connections
    #   maxWait      |         | Maximum time to wait for an available connection
    #   -------------+---------+--------------------------------------------------
    # Common Properties
    database.type=
    database.user=
    database.password=
    database.admin=
    database.admin.password=
    database.host=
    database.port=
    # For oracle use the tablespace
    database.name=
    database.max.pool.size=30
    database.min.pool.size=3
    database.max.wait=30000
    database.jar=<required database jar file>
    # mssql/oracle specific, only populate for mssql or oracle
    database.instance.name=
    # db2 specific, only populate for db2
    database.tablespace=
    database.bufferName=
    database.isNewBuffer=
    
    #ProxySection
    proxy.url=
    proxy=
    proxy.user=
    proxy.password=
    
    #Mongo DB Configuration
    mongodb.thread=20
    mongodb.enabled=false
    mongodb.host=
    mongodb.port=
    mongodb.password=
    mongodb.username=
```

### Container Property Files
A uniquely named container file should be provided for every container that needs to be built and configured for a 
specific environment.  So, if a PM and ND nodes are needed an a single host, it would be required for 2 uniquely named 
container property files.

For a secured container, include the secured flag as true.  Two different JAVA keystores are required for a secure container.  The container keystore `container.secure.keystore` contains the container private key, the second keystore `container.secure.trusted.keystore` contains the trusted certificates for all the containers and listeners in the environment.  If the container identity certificate has a different password then the container keystore, provide the property `container.secure.alias.password`.  At the same time, the `com.soa.security` category will be appropriately updated and the crl flag will be set to false in the `com.soa.crl` category.

Only container required fields are needed in a properties file.  The automation allows property fields to be omitted.  
The following lists what is required based off of the container type:

+ All Containers
    * Common Properties section
    * Features section
    	- Features that are set to true
    * Plugin section
    	- Plugins that are set to true
    * Tool section
    	- Tools that are set to true
    * Configuration Files section (specific properties depends on container type)
        - database.configure
        - proxy.filename
        - route.definitions
        - wsmex.address
    * Hardening Section 
        - container.harden
        - if container.harden is true
            + harden.ignoreCookies
            + harden.secureCookies
            + harden.cipherSuites
            + harden.enabledProtocols
            + harden.cache.expirationPeriod
            + harden.cache.refreshTime
    * Performance Section
        - container.performance
        - if container.performance is true all properties are required
+ CM Only
    * Tenant Properties section
    * Hardening Section
        - if container.harden is true
            + harden.cm.interceptor.blocked
            + harden.cm.allowed.hosts
            + harden.cm.csrf.enabled
            + harden.cm.exception.urls
            + harden.cm.keywords
            + harden.cm.validate
            + harden.cm.x.frame
+ ND Only
    * Configuration Files section
        - org=uddi:soa.com:registryorganization
        - cluster
        - remote.writer.enabled
    * Hardening Section
        - if container.harden is true
            + harden.nd.interceptor.blocked
            + harden.nd.replace.host
            + harden.nd.security.expiration.period
            + harden.nd.security.refresh.time

Automation supports building route files.  For more information on route files see https://support.soa.com/support/index.php?_m=knowledgebase&_a=viewarticle&kbarticleid=607.  
In the container property file, all route files are defined in a the property `route.definitions=`.  An example of an ND routing back through a clustered PM.  The property is configured like `filename;pattern;url`, each route file definition would be seperated by a comma.  Route files can also be added with providing the --deployFiles command switch.

Managing cluster support.  Automation will automatically register an ND container into a Cluster that is created in PM.  If a cluster name is provided and the cluster doesn't exist, the cluster will first be created.  Once the cluster is 
created, the new ND container is then added into this cluster.

Listeners can be created for both ND and clusters.  By default, ND will automatically have a listener for the default interface and port that the container was built to listen on.  For additional required listeners, ND listeners are 
populated with `nd.listener=` and cluster listeners are populated in `cluster.listener=`.  Both of these fields are 
comma seperated fields.  Within each of these fields they are separated by a `:`, so to create a default http listener 
it would look like `default_http0:hostname:9905:http:idleTimeout:poolMax:poolMin:bind:alias:aliasPassword`.  The alias 
and alias password properties are only required if an https listener is being created.

* Name: `default_http0`, defines the name of this listener.  
* Hostname: `hostname`, defines the hostname that is hosting the ND/cluster container.  
* Port: the port that is listening for that container.  
* Protocol: the protocol, this needs to be either 'http' or 'https'. 
* Timeout: the idle timeout of the listener, the default value is '1800000'.
* Max connections: the max number of connections allowed, the default value is '100'.
* Minimum connections: the minimum number of connections that always remain, the value default is '5'.
* Bind: the bind to all interfaces, this needs to be either 'true' or 'false'.
* Alias: the alias to a key that is in the `container.secure.keystore`.
* Alias password: the alias password is an optional field and is only required if the key has a password that is 
different than the containing keystore.

When securing listeners, PKI keys can also be automatically added onto the endpoints.  These certificates need to be added into a custom JKS and provided to the automation scripts.  The property files used for these certificates are  `container.secure.keystore`, `container.secure.storepass` and `container.secure.alias`.  If no JKS is provided an exception will occur, requiring that a JKS is required to add secured endpoints.

Default container listener can be customized by providing the `container.listener.minimum`, `container.listener.maximum` amd `container.listener.idleTimeout`.  These fields will be used to update the default listener that is created when building a container.  This is mostly recommended for the Policy Manager and Community Manager containers.

`--deployFiles` command line option is used to add extra files into a container deploy directory.  This is a final step that occurs.  This can be used for any custom policies or route file definitions.

#### Configure Container Properties
When ND is writing any analytical data through PM, the remote writer needs to be enabled.  The following property needs to be added into the ND container property file.
```
	# disable the remote usage writer in ND containers
    remote.writer.enabled=true
```

To view all services that are deployed into any container, the jetty information servlet needs to be enabled.
``` 
    # com.soa.platform.jetty.cfg
    jetty.information.servlet.enable=true
```

Add the following property if it is required that ND follows all redirects
``` 
    # com.soa.http.client.core.cfg ND only
    http.client.params.handleRedirects=true
```


``` 
    # com.soa.binding.http.cfg ND only
    http.in.binding.virtualhost.endpoint.selection.enabled=false
```


``` 
    # com.soa.binding.soap.cfg ND only
    soap.in.binding.virtualhost.endpoint.selection.enabled=false
```


``` 
    # com.soa.compass.settings.cfg
    compass.engine.optimizer.schedule=true
    compass.engine.optimizer.schedule.period=600
```


``` 
    # com.soa.rollup.configuration.cfg
    monitoring.rollup.configuration.countersForEachRun= 0
```

It is recommended that all rollups are disabled.  The rollups tables should be partitioned using database scripts.  
Include the following properties to disable the rollups.
``` 
    # com.soa.rollup.delete.old.cfg
    monitoring.delete.rollup.MO_ROLLUP15.enable=true
    monitoring.delete.rollup.MO_ROLLUPDATA.enable=true
    monitoring.delete.rollup.MO_ROLLUP_DAY.enable=true
    monitoring.delete.rollup.MO_ROLLUP_HOUR.enable=true
    monitoring.delete.rollup.MO_ROLL_ORG15.enable=true
    monitoring.delete.rollup.MO_ROLL_ORG_D.enable=true
    monitoring.delete.rollup.MO_ROLL_ORG_H.enable=true
    monitoring.delete.usage.enable=true
```

Enable only the valid protocols that will be accepted.  Add the following property to the container property file.
``` 
    # com.soa.http.client.core.cfg 'SSLv3,TLSv1,TLSv1.1,TLSv1.2'
    https.socket.factory.enabledProtocols=
```

Set the search index.
``` 
    # com.soa.search.cfg
    com.soa.search.index.merge.maxSegmentSize=10000000
```

Configure the API Portal (CM) properties.
``` 
    # com.soa.atmosphere.console.cfg CM only
    security.config.basicAuth=false
    security.config.realm=atmosphere.soa.com
    atmosphere.console.config.userDefinedScriptVersion=
    atmosphere.default.policies=
```

Configure the log4j appender and location.  If no appender is provided, it will default to
`org.apache.log4j.RollingFileAppender`.  The location should be the directory that all logs will be sent too.
```
	# com.soa.log
	log4j.appender=
	log4j.location=
```

#### Hardening Tasks
These tasks are the implementation of the [Hardening 2.0](http://docs.akana.com/sp/platform-hardening_2.0.html) recommendations.

During hardening it is recommended to run the admin console on a port different than the actual containers are listening
on.  The following properties are used to move the admin console onto a different port.  The admin console can also be
configured to listen only on the localhost interface.  To configure the admin console to use basic auth, configure
the basic auth option to be true.
```
	container.admin.port=8900
    container.admin.console.localhost.only=false
    container.admin.console.restricted=false
    container.admin.console.basicauth.enabled=true
```

#### Performance Tasks
These tasks are the implementation of the [Performance](http://docs.akana.com/sp/performance-tuning.html) recommendations.

#### Container Features
Install the proper features.  Example property files can be located in the exampleFiles directory within the properties directory.

* [Standalone PM Container](scripts/automation/properties/exampleFiles/Standalone_PM.properties?api=v2)
    * policy.manager.console
    * policy.manager.services
    * security.services
    * mongo.db (if using mongodb for analytical data)
* [PM with CM](scripts/automation/properties/exampleFiles/PM_with_CM.properties?api=v2)
    * Install Standalone PM
    * community.manager
    * community.manager.default.theme
    * community.manager.scheduled.jobs
    * community.manager.simple.developer.theme (If using SimpleDev)
* [PM with CM and OAuth](scripts/automation/properties/exampleFiles/PM_with_CM_and_OAuth.properties?api=v2)
    * Install PM with CM
    * community.manager.oauth.provider
    * oauth.provider
* [PM with remote CM](scripts/automation/properties/exampleFiles/PM_with_remote_CM.properties?api=v2)
    * Install Standalone PM
    * community.manager.scheduled.jobs
    * community.manager.plugin
    * community.manager.policy.console
* [Standalone CM](scripts/automation/properties/exampleFilesStandalone_CM.properties)
    * community.manager.apis
    * community.manager.default.theme
    * community.manager.simple.developer.theme (If using SimpleDev)
* [Standalone CM with OAuth](scripts/automation/properties/exampleFiles/Standalone_CM_with_OAuth.properties?api=v2)
    * Install Standalone CM
    * community.manager.oauth.provider
    * oauth.provider
* [Standalone ND](scripts/automation/properties/exampleFiles/Standalone_ND.properties?api=v2)
    * network.director
    * api.security.policy.handler
* Standalone ND with OAuth
    * Install Standalone ND
    * community.manager.oauth.provider.agent
    * oauth.provider.agent
    * [TODO] Default property file
* [Standalone OAuth](scripts/automation/properties/exampleFiles/Standalone_OAuth.properties?api=v2)
    * community.manager.oauth.provider
    * oauth.provider
    * community.manager.plugin
+ PingFederate Support
    * For CM and ND
        - ping.federate.integration
+ LaaS Support
    * For CM nodes only
        - community.manager.laas
    
* Add Monitoring to any container
    * admin.monitoring.tool
+ Optional Features
    * Site Minder
        - sitemider
        - sitemider
    * SAML WebSSO
        - saml2.sso
        - saml2.sso.ui
    * Development Services
        - devservices
    * Policy Manager for IBM WebSphere DataPower
        - pm.custom.policy
        - pm.websphere.mq
        - pmdp
        - pmdp.slave.node
        - pmdp.console.policy
        - pmdp.malicious.pattern
        - pmdp.oauth
        - pmdp.schema.update
    * Integration Services
    	- integration.services
    * Freemarker
    	- freemarker.activity
    * Header Activity
    	- header.activity
    * Normalize
    	- normalize.activity
        
#### Property File

```
    #CommonProperties
    container.name=pm
    container.key=
    # this is used for the hostname unless the scripts pass in '--hostname'
    container.host=0.0.0.0
    container.port=9900
    container.admin.port=8900
    container.admin.user=administrator
    container.admin.password=password
    container.passwords.encrypted=false
    container.admin.console.localhost.only=false
    container.admin.console.restricted=false
    container.admin.console.basicauth.enabled=true
    # Customize the container default listener settings.  This is only conducted if values exist, otherwise defualts are used.
    container.listener.minimum=
    container.listener.maximum=
    container.listener.idleTimeout=
    container.secure=false
    # The certificates that will be used for container identity, if the default ones are not acceptable
    container.secure.keystore=
    container.secure.storepass=
    container.secure.alias=
    container.secure.alias.password=
    # The trusted certificates that need to be added into this containers cacerts
    container.secure.trusted.keystore=
    container.secure.trusted.storepass=
    
    #FeaturesSection
    agent.foundation=false
    community.manager=false
    community.manager.apis=false
    community.manager.default.theme=false
    community.manager.oauth.provider=false
    community.manager.oauth.provider.agent=false
    community.manager.scheduled.jobs=false
    community.manager.simple.developer.theme=false
    delegate=false
    delegate.access.point=false
    development.services.feature=false
    managed.services=false
    network.director=false
    oauth.provider=false
    oauth.provider.agent=false
    ping.support=false
    policy.manager.console=true
    policy.manager.services=true
    scheduled.jobs=false
    security.services=false
    tomcat.agent=false
    elastic.search=false
    grant.provisionin.ui=false
    
    #PluginSection
    api.security.policy.handler=false
    cluster.support=false
    community.manager.plugin=true
    community.manager.policy.console=true
    external.keystore.feature=false
    kerberos.implementation=false
    community.manager.laas=false
    community.manager.laas.schedule.jobs=false
    ping.federate.integration=false
    mongo.db=false
    
    #ToolSection
    72.upgrade=false
    admin.monitoring.tool=true
    
    #OptionPacks
    # include if siteminder is required
    sitemider=false
    siteminder.ui=false
    site.minder.path=
    # include is configuring SAML authentication
    saml2.sso=false
    saml2.sso.ui=false
    # include for Development Services
    devservices=false
    # PMDP Features
    pm.custom.policy=false
    pm.websphere.mq=false
    pmdp=false
    pmdp.slave.node=false
    pmdp.console.policy=false
    pmdp.malicious.pattern=false
    pmdp.oauth=false
    pmdp.schema.update=false
    # Integration Services
    integration.services=false
    # Freemaker
    freemaker.activity=false
    # Header
    header.activity=false
    # Normalize
    normalize.activity=false
    
    #ConfigurationFiles
    database.configure=true
    proxy.filename=
    # used to route containers through load balancer when needed
    # Format needs to be the following '<routes><route><filename>com.soa.http.route-pm1.cfg</filename><pattern>http://pm.host.com:9900/*</pattern><url>http://lb.host.com</url></route></routes>'
    # Needed when routing requests back through a load balance: https://support.soa.com/support/index.php?_m=knowledgebase&_a=viewarticle&kbarticleid=607
    route.definitions=
    
    # ND specific properties
    # just the address to pm like http://<hostname>:<port>
    wsmex.address=
    # if the PM admin console is running on a different port, than wsmex please provide the address to the PM admin console.  'http://<hostname>:<port>
    pm.admin.console=
    # if the PM admin access is different from this container, set the proper values here
    pm.admin.user=
    pm.admin.password=
    pm.admin.basicauth=
    # If Basic Auth has been disabled for the configjob, set configjob.secured to false
    configjob.secured=true
    # Register ND to PM
    register.nd=true
    # all required listeners to be created for nd.  This is a comma seperated field that consistes of at least 1 entries 'listener_name:hostname:port:protocol:idleTimeout:poolMax:poolMin:bind:alias'.
    # if ND is secured, automation needs to add an endpoint to the listener.  The automation will use the 'container.secure.keystore' to search from the proper certificate for each listener
    nd.listener=
    # org needs to be a valid uddi key (Change if container needs to be in a different organization)
    # Change if ND is required to be under a different organization
    org=uddi:soa.com:registryorganization
    # Name of the cluster to add the ND container into
    cluster=
    # all required listeners to be created for the cluster, if the cluster doesn't exist.  This is a comma seperated field that consistes of at least 1 entries 'listener_name:hostname:port:protocol:idleTimeout:poolMax:poolMin:bind'
    cluster.listener=
    # disable the remote usage writer in ND containers
    remote.writer.enabled=true
    
    # com.soa.platform.jetty.cfg ND only
    jetty.information.servlet.enable=false
    # com.soa.http.client.core.cfg ND only
    http.client.params.handleRedirects=true
    # com.soa.binding.http.cfg ND only
    http.in.binding.virtualhost.endpoint.selection.enabled=false
    # com.soa.binding.soap.cfg ND only
    soap.in.binding.virtualhost.endpoint.selection.enabled=false
    
    # com.soa.compass.settings.cfg
    compass.engine.optimizer.schedule=true
    compass.engine.optimizer.schedule.period=600
    # com.soa.rollup.configuration.cfg
    monitoring.rollup.configuration.countersForEachRun= 0
    # com.soa.rollup.delete.old.cfg
    monitoring.delete.rollup.MO_ROLLUP15.enable=false
    monitoring.delete.rollup.MO_ROLLUPDATA.enable=false
    monitoring.delete.rollup.MO_ROLLUP_DAY.enable=false
    monitoring.delete.rollup.MO_ROLLUP_HOUR.enable=false
    monitoring.delete.rollup.MO_ROLL_ORG15.enable=false
    monitoring.delete.rollup.MO_ROLL_ORG_D.enable=false
    monitoring.delete.rollup.MO_ROLL_ORG_H.enable=false
    monitoring.delete.usage.enable=false
    # com.soa.http.client.core.cfg 'SSLv3,TLSv1,TLSv1.1,TLSv1.2'
    https.socket.factory.enabledProtocols=
    # com.soa.search.cfg
    com.soa.search.index.merge.maxSegmentSize=10000000
    
    # com.soa.atmosphere.console.cfg CM only
    security.config.basicAuth=false
    security.config.realm=atmosphere.soa.com
    atmosphere.console.config.userDefinedScriptVersion=
    atmosphere.default.policies=
    
    #TenantProperties
    # CM specific properties
    atmosphere.context.root=
    # users configured in community manager
    atmosphere.config.userRolesDenied=
    tenant.url=http://localhost:9900 
    tenant.name=EnterpriseAPI 
    tenant.id=enterpriseapi
    tenant.address=http://localhost:9900 
    tenant.console.address=http://localhost:9900/enterpriseapi 
    tenant.theme=default 
    tenant.admin.email=admin@open 
    tenant.admin.password=password 
    tenant.contact.email.address=no-reply@open 
    tenant.from.email.address=no-reply@open
    tenant.virtual.hosts=
    # Added 7.2.8
    tenant.create=false
    
    #HardeningProperties
    # Hardening properties are set to recommended values.  Change if desired.  For details review: http://docs.akana.com/sp/platform-hardening_2.0.html
    container.harden=true
    harden.ignoreCookies=ignoreCookies
    harden.secureCookies=true
    harden.cipherSuites=SSL_RSA_WITH_RC4_128_MD5,SSL_RSA_WITH_RC4_128_SHA,TLS_RSA_WITH_AES_128_CBC_SHA,TLS_DHE_DSS_WITH_AES_128_CBC_SHA,SSL_RSA_WITH_3DES_EDE_CBC_SHA,SSL_DHE_DSS_WITH_3DES_EDE_CBC_SHA
    harden.cache.expirationPeriod=3600000
    harden.cache.refreshTime=300000
    # only configured on ND containers
    harden.nd.interceptor.blocked=content-type,content-length,content-range,content-md5,host,expect,keep-alive,connection,transfer-encoding,atmo-forward-to,atmo-forwarded-from
    harden.nd.template=replace=X-Forwarded-Host:{host}
    # only configured on CM Containers
    harden.cm.interceptor.blocked=content-type,content-length,content-range,content-md5,host,expect,keep-alive,connection,transfer-encoding
    harden.cm.template=
    # Added 7.2.8 (Hardening 2.0)
    harden.enabledProtocols=SSLv2HELLO,TLSv1,TLSv1.1, TLSv1.2
    harden.nd.replace.host={host}
    harden.nd.security.expiration.period=3600000
    harden.nd.security.refresh.time=300000
    harden.cm.allowed.hosts==<Network Director Host(s) and/or Load Balancer host>
    harden.cm.csrf.enabled=true
    harden.cm.exception.urls=#COMMA DELIMITED LIST]
    harden.cm.keywords=#COMMA DELIMITED LIST]
    harden.cm.validate=#true|false]
    harden.cm.x.frame=#DESIRED HEADER]
    
    #PerformanceProperties
    # Performance properties need to be set appropriately for your desired results.  Values currently set are for examples only.
    #    For details review: http://docs.akana.com/sp/performance-tuning.html
    container.performance=true
    performance.connection.maxTotal=2000
    performance.connection.defaultMaxPerRoute=1500
    performance.loadGifMetrics=false
    performance.performAutoSearch=true
    performance.requireMetricsPolicy=true
    performance.failureDataCaptureEnabled=true
    # ND containers to controll the usage writer
    performance.queueCapacity=10000
    performance.usageBatchSize=50
    performance.writeInterval=1000
    performance.preloadInvokedServices=true
    performance.framework.idleExpiration=259200
    performance.framework.makeFreshInterval=900
    performance.endpoint.allowRemoval=false
    performance.endpoint.expirationInterval=3600000
    performance.endpoint.maxrefreshInterval=900000
```

### License
Copyright 2015 Akana, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
