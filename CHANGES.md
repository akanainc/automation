# Changes

v8.4.21

* Fix to add double quotes around JAVA_OPTS in startup.sh

* More fixes to support PM behind a secured load balancer.

* Fix where the ND metadata was only checking secured ports.

* Fix for when you need to delete a listener and the PM is behind a secured ND.

---

v8.4.19

* Support to register the ND container via a secured load balancer.

---

v8.4.18

* Updated the listener cert upload to support large JKS files.

* Added support for `wsdl.storage.manager.maxEntries` in `com.soa.wsdl`.  This is only added to ND container property files.  If this is missing, it will default to -1.

    ```properties
    # com.soa.wsdl
    wsdl.storage.manager.maxEntries=-1
    ```

* Added support for `QuickSearch.enabled` in `com.soa.console`.  

    ```properties
    # com.soa.console
    QuickSearch.enabled=false
    ```
    
* Added support for `validate.algorithms` in `com.soa.wssecurity`.  This is only added to ND container property files.

    ```properties
    # com.soa.wssecurity
    validate.algorithms=false
    ```

---

v8.4.17

* Changed `email.sender` to update `com.soa.console` over `com.soa.framework`.

* Updated the spelling of promotor to `remote.promotor.address`.

* Added the ability to configure custom health panels during container creation.  For more details, review the automation documentation.  Custom health panels are added by including the following property in the container properties file:

    ```properties
    custom.health.panels={ \
    	"healthPanels": [{ \
    		"name": "Managed Service Count", \
    		"attributes": [{ \
    			"parent": "com.akana.endpoint.deployment.stats", \
    			"children": [ \
    				"managed.service.count" \
    			] \
    		}] \
    	}, { \
    		"name": "My Health Variables", \
    		"attributes": [{ \
    			"parent": "soa.transport.jetty", \
    			"children": [ \
    				"pool.threads" \
    			] \
    		}] \
    	}] \
    }
    ```

* Added the ability to turn on SSL debug for the JVM when running the Jython Scripts.  Use `--ssldebug` on the command line.

* For Windows installs, changed `AUTO_START` to `auto`.  The registration script was expecting `auto`.

* Added the ability to configure MongoDB readPreference.  Valid values are:
    * primary
    * primaryPreferred
    * secondary
    * secondaryPreferred
    * nearest
    
    Include the following property:

    ```properties
    mongo.readPreference=primary
    ```
* Add the mongo property for auto install

    ```properties
    persistence.mongodb.autoinstall=false
    ```
    
---    

v8.4.16

* Fixed the way new deployment zones are created.

* Fix for failover DB url to work

* Fix where a port was being checked for when creating a JMS listener.

* Added support for trace agents like `DynaTrace` or `AppDynamics`.  The container properties files needs to have the appropriate property added with the location of the trace jar agent.  For AppDynamics, it will automatically include `com.singularity.*` to the boot classpath.

    ```properties
    # agent path for dynatrace or appdynamics
    #   for appdynamics
    javaagent=
    #   for dynatrace
    agentpath=
    ```
    
* Added support in install the plug-in `Akana Lifecycle Manager API Platform Extension`

    ```properties
    lifecycle.manager.api.platform.extension=true
    ```

* Added the ability to set the Promotor address when using LC

    ```properties
    # com.soa.promotion
    remote.promoter.address=https:my_cm_container:9900
    ```

---

v8.4.15

* Fixed the way that listener certificates are uploaded to the container.

* Update on how the ES secured is configured.

* Exposed the ability to extend the ncsa data

    ```properties
    ncsa.access.log.extended=true
    ``` 
    
* Exposed monitoring to include messages or not

    ```properties
    monitoring.delete.usage.includeMessages=true
    ``` 
    
* Added support to control the mapReduce time in MongoDB

    ```properties
    persistence.mongodb.mapReduceMaxExecTime=
    ``` 
    
* Added support rollup timezones

    ```properties
    metric.evaluator.timeZoneMappings=UTC:GMT,America/Los_Angeles:PST
    statistic.dao.timeZoneMappings=UTC:GMT,America/Los_Angeles:PST
    monitoring.rollup.configuration.dailyRollupTimeZones=GMT
    ```

---

v8.4.14

* Fixed the ability to add a stand-alone scheduler container.

* Exposed the ability to control the number of alerts

    ```properties
    number.of.alerts.to.dispatch.in.one.run=100
    ``` 
    
* Moved `com.soa.console.xss` from being a CM container only setting, to being set for all containers.

* Adding properties to control the deletion scheme for rollups

    ```properties
    monitoring.delete.usage.unit=week
    monitoring.delete.usage.windowSize=1
    ```

---

v8.4.13

* Added `db.url` to the environment.properties file.  This will be used to override the default setting and dynamically 
use automation to configure the failover settings.  Do NOT include this property to set the default settings.  Include 
this property to set a failover.  The following displays how to configure failover for oracle, replacing `<hostA>`, 
`<hostB>`, `<port>` and `<service_name>`:

    ```properties
    db.url=jdbc:oracle:thin:@(description=(ADDRESS_LIST=(address=(host=<hostA>)(protocol=tcp)(port=<port>))(address=(host=<hostB>)(protocol=tcp)(port=<port>))(FAILOVER=on)(LOAD_BALANCE=off))(connect_data=(SERVER=DEDICATED)(service_name=<service_name>)))
    ```

* Setting the value to send the Jetty server version or not.  This is a Hardening value: http://docs.akana.com/sp/platform-hardening_8.4.html#configuring-server-header

    ```properties
    jetty.server.sendServerVersion=false
    ```
    
* Added the ability to control the retention of access logs.

    ```properties
    ncsa.access.log.retainDays=7
    ```

---

v8.4.12

* Fix for updating the TENANTS, INDEX_TARGET column to be set to `elastic`

* Fix for container listener not being properly renamed.

* Added the ability to secure a mongo connection.  The default will always to be not be secured.  Include the following 
property when the connection needs to be secured.

    ```properties
    mongo.ssl=true
    # Alias is used to pull the required cert from the container.secure.trusted.keystore and added to the default keystore
    #   using this same alias
    mongo.alias=mongodb
    # The following is not required and will default to the $JAVA_HOME/lib/security/cacerts and password defaults to the
    #   java default password
    default.keystore.location=
    default.keystore.password=
    ```
    
* Update the Password Encryption tool to no longer require NodeJS.  This will now just run as a Java application.  Run
the following command from the installation directory.

    ```properties
    java -jar com.akana.ps.automation.security.jar myPasswordToBeEncrypted
    ```

    * This will output the result that needs to be added into the properties file.

        ```properties
        Encrypted Password:  H5m3IqiZDUTaiIs3AoB795Qn0a2dOXCL
        ```
    
    * The following properties need should be encrypted:

        * container.properties
    
            ```properties
            container.admin.password=
            container.secure.alias.password=
            container.secure.storepass=
            container.secure.trusted.storepass=
            pm.master.password=
            pm.admin.password=
            cm.admin.password=
            if tenant.create=true then adminPassword
            elastic.client.aliasPassword=
            elastic.client.clientUserPassword=
            elastic.client.keystorePassword=
                if com.soa.keystore.external.encrypted=false then com.soa.keystore.external.password= else it is already encrypted
        ```
        
        * environment.properties
    
            ```properties
            database.password=
            database.admin.password=
            proxy.password=
            mongodb.password=
            default.keystore.password=
            ```
            

---

v8.4.11
* Add the ability to enable the ncsa access logs and set a custom location for these logs.

    ```properties
    ncsa.access.log.enable=true
    ncsa.access.log.filename=${product.home.dir}/instances/${container.name}/log/jetty_access_yyyy_mm_dd.log
    ```

* Support for calling PM API's with a completely different user/password combination, then what is configured for the PM Admin.  The hiarchy of which user/password to use when calling PM API's is:
    * PM Master User/Password
    * PM Admin User/Password
    * Container Admin User/Password
 
    The following properties are to be used:
 
    ```properties
    pm.master.address=
    pm.master.user=
    pm.master.password=
    ```
    
* Added Version file

* Forced the container id into an int, when it is returned as a non int or non string when configuring Elastic Search.

* Updates to the main documentation

* Added support to set an HSM alias as the outbound certificate

---

v8.4.10
* Fix for killing the server if the server doesn't properly shutdown.  The script will now substring to find an exact match.

---

v8.4.9

* Fix for when the admin console is on localhost

* Fix to wait for the ES port to close when using Embedded

* Update to properly call the /counter api when using a sharded mongo/ND

* Fix for password encryption utility.

* Added `pmcontext.path` to the properties file.  This allows the changing of the context path to the PM Console.  The should be set to a different path for externally faced CM containers.

    ```properties
    pmcontext.path=
    ```

---

v8.4.7

* Moved the deployment of custom policies up to happen prior to setting anything that is in the `custom.properties` property.

* Ability to set the /admin console on a different interface than what the app is running on.  Also, provide an option to control the bind to all flag.  Two new properties are added:

    ```properties
    container.admin.host=
    container.admin.bindToAll=true
    ```

---

v8.4.6

* Fix for when Elastic Search global minimum nodes being NONE

* Miscellaneous document updates

* Changes to the spinner to be a progress bar

* Fixed for adding the path properly when only a trusted JKS is supplied.

* Added the ability to override the default environment.properties file.  You are still required to have the word 'environment' in the property file.  This prevents it from being picked up as a container property file.  Use the following tag:

    ```properties
    --environmentproperties <new file name>
    
    * example
    --environmentproperties ctx-environment.properties
    ```

* Deploy files can be set in the container property file.  This is needed when a single installation is hosting multiple containers.  Add the following property to the required container property file:

    ```properties
    container.deploy.files=
    ```

* Custom Policies can be set in the container property file.  This needs to be an absolute path to an archive file that contains all custom policies/features.  This is needed when a single installation is hosting multiple containers.  Add the following property to the required container property file:

    ```properties
    container.custom.policies=
    ```

* When uploading a certificate to a listener, the script will first try to use the keystore.  If no keystore is configured, it will then pass the trusted keystore.

* Support for Windows deployments to update any JVM options.  Add the following:

    ```properties
    --javaopts "-Xmx4096M"
    ```

* When running a `-s`, the script will clean out any existing property files in the properties directory, before pushing the property files.  This insures that an old property file isn't accidentally left in this directory.

* Added the ability to upload a key and x.509 certificate to the outbound listener of a container.  Add the following property to the container property file:

    ```properties
    outbound.listener={\
      'alias':<name of alias in keystore>,\
      'password':<password of alias, defaults to keystore password>\
    }
    ```

* Securing Elastic Search server.  Add the following properties to the container property file:

    ```properties
    # com.akana.es.client.security
    elastic.client.alias=
    elastic.client.aliasPassword=
    elastic.client.clientUser=
    elastic.client.clientUserPassword=
    elastic.client.enableSSL=false
    elastic.client.keystorePassword=
    elastic.client.keystorePath=
    ```

* Set the search engines that can be used in any process scripts.  It is recommended that you only set to use `js`.

    ```properties
    # com.soa.script.framework
    script.engine.manager.enabled=
    script.engine.manager.engines=
    ```

* Ability to set the elastic search index configuration properties.

    ```properties
    # com.akana.elasticsearch
    elastic.config.index.number.of.replicas=
    elastic.config.index.number.of.shards=
    ```

* Updated the performance variable from `performance.framework.makeFreshInterval` to `performance.framewor.maxRefreshIntervale`.  This changes *REQUIRES* an update to the Network Directory property files.

    ```properties
    performance.framework.maxRefreshInterval=900
    ```

* Added the ability to delete an existing container from the installer.py script.  The command would look something like:

    ```properties
    ./installer.py -d --key <container key> --host <address to the PM server> --administrator <administrator user> --password <user password> --installpath <installation path>
    ```

* Passing just a `--name` is also supported.  In this case, it is assumed the script is running on the same server hosting the container.  The command would look like:

    ```properties
    ./installer.py -d --name <container name> --host <address to the PM server> --administrator <administrator user> --password <user password> --installpath <installation path>
    ```

* If running the delete option with a JRE that is external to the install directory, provide the `--javaHome` flag.  Command would look like:

    ```properties
    ./installer.py -d --name <container name> --host <address to the PM server> --administrator <administrator user> --password <user password> --installpath <installation path> --javaHome <absolute path to JRE>
    ```

---

v8.4.5

* Cleaned up repetitive logging of: 
    * Searching for Container Listener
    * Update Container Description

* Added 2 new Mongo environment features for pointing to the Admin database for authentication

    ```properties
    mongo.authSource=
    mongo.authMechanism=
    ```

* Enable sending client certificates when calling API services.  This is done whenever a trust store is passed in.  The required client certificate needs to exist in the trust store.

* Fixed configuring Elastic Search when used in transport mode.  The Elastic Search configuration would look like:

    ```properties
    elastic.search.configuration = { \
        "transportClientConfig" : { \
            "clusterName" : "MyESCluster", \
            "minimumMasterNodes" : 1, \
            "esServerUrl" : "10.1.21.10:9300" \
        } \
    }
    ```

* Fixed the bug `TypeError: int() argument must be a string or a number, not '2'`, when configuring elastic search that already had a global definition in the database.

* HSM clients can now update the listener certificate to a different certificate than the container identity certificate.  The following property will enable this:

    ```properties
    listener={\
        'Endpoints':[{\
            'name':'https',\
            'bindtoall':'false',\
            'protocol':'https',\
            'host':'hostname',\
            'port':'9900',\
            'minimumThreadPool':5,\
            'maximumThreadPool':500,\
            'idleThreadTimeout':1800000,\
            'alias':'sitcm',\
            'aliasPassword':''\
        }]\
    }
    ```

    ```properties
    # com.akana.elasticsearch
    elastic.config.index.number.of.replicas=
    elastic.config.index.number.of.shards=
    ```

---

v8.4.4

* Added support to install the Lifecycle Coordinator feature.  

Automation currently will only install the Lifecycle Coordinator feature.  Not that there is required tasks that need to be done in the /admin console.  

Add `database.coordinator` to install one of the database schemas.  The Lifecycle Coordinator Schema will need to be installed manually.

Add `lifecycle.coordinator` to the container property file to install the actual feature to the coordinator.

* Secure the /metadata service.

In the latest version of the hardening document (), it is recomended to secure the /metadata service.  This can be conducted by adding `secure.metadata.service=true` to the container property file.

* Add all mongo configuration properties

Added the ability to configure everything about a mongo connection.  Added the properties to the environment.properties file:

    ```properties
    mongo.databasename
    mongo.connect.timeout
    mongo.socket.timeout
    mongo.min.poolSize
    mongo.max.poolSize
    mongo.wait.queue
    mongo.wait.queue.timeout
    ```

* Fixes to the API request when the response if anything greater than a 400 response code.

---

v8.4.3

* Added the requests and urllib3 libraries into the product.  These are now used to conduct all TCP requests.  Implemented Session objects to manage all connections.
* Updated how new clusters are created.  Now using 'application/x-www-form-urlencoded' request.
* Support for Windows installation and Upgrades from 7.2/8.0/8.2