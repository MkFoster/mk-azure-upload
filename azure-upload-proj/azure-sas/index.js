// An HTTP trigger Azure Function that returns a SAS token for Azure Storage for the specified container. 
// You can also optionally specify a particular blob name and access permissions. 
// To learn more, see https://github.com/Azure-Samples/functions-dotnet-sas-token/blob/master/README.md

var azure = require('azure-storage');

module.exports = function(context, req) {
    if (req.body.container) {
        context.res = {
            body: generateSasToken(context, req.body.container, req.body.blobName)
        }
    } else {
        context.res = {
            status: 400,
            body: "Specify a value for 'container'"
        };
    }

    context.done();
};

function generateSasToken(context, container, blobName) {
    var connString = process.env.AzureWebJobsStorage;
    var blobService = azure.createBlobService(connString);

    // Create a SAS token that expires in an hour
    // Set start time to five minutes ago to avoid clock skew.
    var startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 5);
    var expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 60);

    //permissions = permissions || azure.BlobUtilities.SharedAccessPermissions.READ;

    // The following values can be used for permissions: 
    // "a" (Add), "r" (Read), "w" (Write), "d" (Delete), "l" (List)
    // Concatenate multiple permissions, such as "rwa" = Read, Write, Add

    var sharedAccessPolicy = {
        AccessPolicy: {
            Permissions: 'w',
            Start: startDate,
            Expiry: expiryDate
        }
    };

    var sasToken = blobService.generateSharedAccessSignature(container, blobName, sharedAccessPolicy);

    const output = {
        token: sasToken,
        uri: blobService.getUrl(container, blobName, sasToken, true)
    };
    console.log(output);
    return output;
}