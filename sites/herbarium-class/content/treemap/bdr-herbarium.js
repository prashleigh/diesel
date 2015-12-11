define(['BDR', 'jquery'], function(bdr, $) {
    
  var HERB_COLLECTION_NUM = 654,
      specimenTree, // cache of specimen tree
      f = {
          pid: 'pid',
          family: 'dwc_family_ssi',
          genus: 'dwc_genus_ssi',
          species: 'dwc_specific_epithet_ssi',
          coll: 'ir_collection_id',
          state: 'dwc_state_province_ssi'
        };

  // Arguments: getSpecimensUnder([genus, family, epithet], onCompeteFunction)
  //        or: getSpecimensUnder([genus, family, epithet], existingTree, onCompeteFunction)


  /*

  getSpecimenTable({
    pid: String,
    genus: String,
    family: String,
    species: String,
    collectionDate: Date,
    state: String
  })

  getSpecimenTree

  */

  // MUCH OF THIS CODE SHOULD BE MOVED TO A GENERALIZED SOLR QUERY ROUTINE IN BDR OBJECT

  function getSpecimens (qy, onComplete) {
    
    // Check cache and use it if available
    
    if (false && specimenTree !== undefined) { // TEMPORARILY DISABLED - cause it's not working
      var subTree;
      if (qy.family) {
        subTree = specimenTree[qy.family];
        if (qy.genus) {
          subTree = specimenTree[qy.family][qy.genus];
          if (qy.species) {
            subTree = specimenTree[qy.family][qy.genus][qy.species];
          }
        }
      }
      console.log("CACHED ********************************************");
      console.log(qy);
      console.log(subTree);
      onComplete(subTree);
    } else {
      specimenTree = {};
    }

    var getDjatokaUrl = function (pid, level) {
          return 'https://repository.library.brown.edu/adore-djatoka/resolver' + 
                 '?svc_id=info:lanl-repo/svc/getRegion&svc_val_fmt=info:ofi/fmt:kev:mtx:jpeg2000' +        
                 '&svc.level=' + level +
                 '&rft_id=https://repository.library.brown.edu/fedora/objects/' + pid + '/datastreams/JP2/content' + 
                 '&url_ver=Z39.88-2004&svc.format=image/jpeg';
        },

        getImgUrlFromPidFunction = function (pid) {

          var USE_PLACEHOLDER = false,
              PLACEHOLDER_URL = 'placeholder.png';
          
          return function (imgHeight) {
            var url;
            
            if (USE_PLACEHOLDER)
              url = PLACEHOLDER_URL;
            else if (imgHeight <= 200)
              url = 'https://repository.library.brown.edu/viewers/image/thumbnail/' + pid;
            else if (imgHeight <= 351)
              url = getDjatokaUrl(pid, 2);
            else if (imgHeight <= 702)
              url = getDjatokaUrl(pid, 3);
            else if (imgHeight <= 1404)
              url = getDjatokaUrl(pid, 4);
            else if (imgHeight <= 2808)
              url = getDjatokaUrl(pid, 5);
            else
              url = getDjatokaUrl(pid, 6);

            return url;
          };
        },

        url = 'https://repository.library.brown.edu/api/search/?' +
              'q=' +
              f.coll + ':' + HERB_COLLECTION_NUM + ' ' + // Only Herbarium collection
              ['family', 'genus', 'species', 'state'].map(function (x) {
                return (qy[x] ? f[x] + ':' + qy[x] + ' ' : '')
              }).join(' ') +
              '&fl=' + 
              ['pid','genus','family','species'].map(function(x) { return f[x] }).join(','),

        BATCH_SIZE = 500,

        callbackCode = '&callback=?',
        batchSizeCode = '&rows=' + BATCH_SIZE,
        startCode = function (startAt) {
          return '&start=' + startAt
        },

        getBatch = function (startAt, onLoad) {
          
          var batchUrl = url + batchSizeCode + startCode(startAt) + callbackCode;

          $.getJSON(batchUrl, function(json) {

            json.response.docs.forEach(function (spec, _, _) {

              if (specimenTree[spec[f.family]] === undefined)
                specimenTree[spec[f.family]] = {};
              if (specimenTree[spec[f.family]][spec[f.genus]] === undefined)
                specimenTree[spec[f.family]][spec[f.genus]] = {};
              if (specimenTree[spec[f.family]][spec[f.genus]][spec[f.species]] === undefined)
                specimenTree[spec[f.family]][spec[f.genus]][spec[f.species]] = {
                  size: 0,
                  imageUrls: []
                };

              specimenTree[spec[f.family]][spec[f.genus]][spec[f.species]].imageUrls
              .push(getImgUrlFromPidFunction(spec.pid));
              specimenTree[spec[f.family]][spec[f.genus]][spec[f.species]].size++;
            });

            onLoad();
          });
        };

    // Get overall info and grab data
    
    $.getJSON(url + callbackCode, function (json) {
      
      var startAt,
          totalNumber = json.response.numFound,
          totalNumberLoaded = 0,
          onJsonLoad = function () {
            console.log('* LOADED: ' + totalNumberLoaded + '/' + totalNumber);
            if (totalNumber - totalNumberLoaded <= BATCH_SIZE) {
              onComplete(specimenTree);
            }
            totalNumberLoaded += BATCH_SIZE;
          };

      for (startAt = 0; startAt <= totalNumber; startAt += BATCH_SIZE) {
        getBatch(startAt, onJsonLoad);
      }
    });
  }
  
  // Get facet of families
  
  function getFamilyFacets (onLoaded) {
    BDR.getFacets({ coll: HERB_COLLECTION_NUM }, [f.family], function (facetData) {
      onLoaded(facetData[f.family]);
    });
  }
  
  // Get facet of genii
  
  function getGenusFacets (family, onLoaded) {
    var qy = { coll: HERB_COLLECTION_NUM };
    qy[f.family] = family;
    BDR.getFacets(qy, [f.genus], function (facetData) {
      onLoaded(facetData[f.genus]);
    });
  }
  
  // Get facets given taxonomic query
  
  function getTaxFacets (taxQy, onLoaded) {
    var qy = { coll: HERB_COLLECTION_NUM };
    
    if (taxQy.family) qy[f.family] = taxQy.family;
    if (taxQy.genus) qy[f.genus] = taxQy.genus;
    if (taxQy.species) qy[f.species] = taxQy.species;
    
    BDR.getFacets(qy, [f.family, f.genus, f.species], function (facetData) {
      onLoaded({
        family: facetData[f.family],
        genus: facetData[f.genus],
        species: facetData[f.species]
      });
    });
  }

  // Add Herbarium object to BDR interface object
  
  window.BDR.herbarium = {
    getSpecimens : getSpecimens,
    getFamilyFacets : getFamilyFacets,
    getGenusFacets : getGenusFacets,
    getTaxFacets : getTaxFacets
  };  
});