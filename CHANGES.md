# Changes

v8.4.6

* Fix for when Elastic Search global minimum nodes being NONE

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