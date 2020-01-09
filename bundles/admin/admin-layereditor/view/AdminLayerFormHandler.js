import { stringify } from 'query-string';
import { getLayerHelper } from './LayerHelper';
import { StateHandler, controllerMixin } from 'oskari-ui/util';

class UIHandler extends StateHandler {
    constructor (consumer) {
        super();
        this.mapLayerService = Oskari.getSandbox().getService('Oskari.mapframework.service.MapLayerService');
        this.mapLayerService.on('availableVersionsUpdated', () => this.updateLayerTypeVersions());
        this.log = Oskari.log('AdminLayerFormHandler');
        this.loadingCount = 0;
        this.layerHelper = getLayerHelper(Oskari.getSupportedLanguages());
        this.setState({
            layer: {},
            layerTypes: this.mapLayerService.getLayerTypes(),
            versions: [],
            capabilities: {},
            messages: [],
            loading: false
        });
        this.addStateListener(consumer);
        this.fetchRolesAndPermissionTypes();
    }

    updateLayerTypeVersions () {
        const { layer } = this.getState();
        this.updateState({
            layerTypes: this.mapLayerService.getLayerTypes(),
            versions: this.mapLayerService.getVersionsForType(layer.type)
        });
    }

    setType (type) {
        this.updateState({
            layer: { ...this.getState().layer, type },
            versions: this.mapLayerService.getVersionsForType(type)
        });
    }
    setLayerUrl (url) {
        this.updateState({
            layer: { ...this.getState().layer, url }
        });
    }
    setVersion (version) {
        if (!version) {
            // for moving back to previous step
            this.updateState({
                capabilities: {},
                layer: { ...this.getState().layer, version: undefined }
            });
            return;
        }
        this.fetchCapabilities(version);
    }
    layerSelected (name) {
        const { capabilities, layer } = this.getState();
        if (!capabilities || !capabilities.layers) {
            this.log.error('Capabilities not available. Tried to select layer: ' + name);
            return;
        }
        const found = capabilities.layers[name];
        if (found) {
            this.updateState({
                layer: this.layerHelper.fromServer({ ...layer, ...found })
            });
        } else {
            this.log.error('Layer not in capabilities: ' + name);
        }
    }
    setUsername (username) {
        this.updateState({
            layer: { ...this.getState().layer, username }
        });
    }
    setPassword (password) {
        this.updateState({
            layer: { ...this.getState().layer, password }
        });
    }
    setLayerName (name) {
        this.updateState({
            layer: { ...this.getState().layer, name }
        });
    }
    setLocalizedLayerName (lang, name) {
        const localized = `name_${lang}`;
        this.updateState({
            layer: {
                ...this.getState().layer,
                [localized]: name
            }
        });
    }
    setLocalizedLayerDescription (lang, description) {
        const localized = `title_${lang}`;
        this.updateState({
            layer: {
                ...this.getState().layer,
                [localized]: description
            }
        });
    }
    setDataProvider (dataProvider) {
        this.updateState({
            layer: {
                ...this.getState().layer,
                groupId: dataProvider
            }
        });
    }
    setMapLayerGroup (checked, group) {
        const layer = { ...this.getState().layer };
        if (checked) {
            layer.maplayerGroups = [...layer.maplayerGroups, group.id];
        } else {
            const found = layer.maplayerGroups.find(cur => cur === group.id);
            if (found) {
                layer.maplayerGroups = [...layer.maplayerGroups];
                layer.maplayerGroups.splice(layer.maplayerGroups.indexOf(found), 1);
            }
        }
        this.updateState({ layer });
    }
    setOpacity (opacity) {
        this.updateState({
            layer: { ...this.getState().layer, opacity }
        });
    }
    setMinAndMaxScale (values) {
        this.updateState({
            layer: {
                ...this.getState().layer,
                maxscale: values[0],
                minscale: values[1]
            }
        });
    }
    setStyle (style) {
        this.updateState({
            layer: { ...this.getState().layer, style }
        });
    }
    setStyleJSON (styleJSON) {
        this.updateState({
            layer: { ...this.getState().layer, styleJSON }
        });
    }
    setHoverJSON (hoverJSON) {
        this.updateState({
            layer: { ...this.getState().layer, hoverJSON }
        });
    }
    setMetadataIdentifier (metadataid) {
        this.updateState({
            layer: { ...this.getState().layer, metadataid }
        });
    }
    setGfiContent (gfiContent) {
        this.updateState({
            layer: { ...this.getState().layer, gfiContent }
        });
    }
    setAttributes (attributes) {
        // TODO; Fix attributes input area JSON parsing.
        this.updateState({
            layer: { ...this.getState().layer, attributes }
        });
    }
    setMessage (key, type) {
        this.updateState({
            messages: [{ key, type }]
        });
    }
    setMessages (messages) {
        this.updateState({ messages });
    }
    resetLayer () {
        this.updateState({
            layer: this.layerHelper.createEmpty(),
            versions: []
        });
    }
    ajaxStarted () {
        this.updateLoadingState(true);
    }
    ajaxFinished () {
        this.updateLoadingState(false);
    }
    updateLoadingState (loadingStarted) {
        if (loadingStarted) {
            this.loadingCount++;
        } else {
            this.loadingCount--;
        }
        this.updateState({
            loading: this.isLoading()
        });
    }

    // http://localhost:8080/action?action_route=LayerAdmin&id=889
    fetchLayer (id) {
        this.clearMessages();
        if (!id) {
            this.resetLayer();
            return;
        }
        this.ajaxStarted();
        fetch(Oskari.urls.getRoute('LayerAdmin', { id }), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            this.ajaxFinished();
            if (!response.ok) {
                this.setMessage('TODO', 'error');
            }
            return response.json();
        }).then(json => {
            this.updateState({
                layer: this.layerHelper.fromServer(json.layer)
            });
        });
    }

    /**
     * Initializes layer model used in UI
     * @param {Oskari.mapframework.domain.AbstractLayer} layer
     */
    initLayerState (layer) {
        this.clearMessages();
        if (!layer) {
            this.resetLayer();
            return;
        }
        this.updateState({
            layer: this.layerHelper.fromAbstractLayer(layer)
        });
    }

    /**
     * @method getMVTStylesWithSrcLayer
     * Styles in MVT layer options contain data source layer names as filtering keys.
     * This function set styles with the layer child.
     * @return {Object} styles object with layer name filters for easier JSON editing.
     */
    getMVTStylesWithSrcLayer (styles, layerName) {
        if (!styles) {
            return;
        }
        const styleJson = JSON.parse(styles);
        Object.keys(styleJson).forEach(function (styleKey) {
            var mvtSrcLayerStyleDef = {};
            mvtSrcLayerStyleDef[layerName] = styleJson[styleKey];
            styleJson[styleKey] = mvtSrcLayerStyleDef;
        });
        return styleJson;
    }

    saveLayer () {
        const notImplementedYet = true;
        // FIXME: This should use LayerAdmin route and map the layer for payload properly before we can use it
        if (notImplementedYet) {
            alert('Not implemented yet');
            return;
        }

        // Modify layer for backend
        const layer = { ...this.getState().layer };
        const layerGroups = layer.maplayerGroups;
        layer.maplayerGroups = layer.maplayerGroups.map(cur => cur.id).join(',');

        const validationErrorMessages = this.validateUserInputValues(layer);

        if (validationErrorMessages.length > 0) {
            this.setMessages(validationErrorMessages);
            return;
        }
        this.setLayerOptions(layer);
        // TODO Reconsider using fetch directly here.
        // Maybe create common ajax request handling for Oskari?
        fetch(Oskari.urls.getRoute('SaveLayer'), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stringify(layer)
        }).then(response => {
            if (response.ok) {
                this.setMessage('messages.saveSuccess', 'success');
                return response.json();
            } else {
                this.setMessage('messages.saveFailed', 'error');
                return Promise.reject(Error('Save failed'));
            }
        }).then(data => {
            if (layer.id) {
                data.groups = layerGroups;
                this.updateLayer(layer.id, data);
            } else {
                this.createlayer(data);
            }
        }).catch(error => this.log.error(error));
    }

    updateLayer (layerId, layerData) {
        this.mapLayerService.updateLayer(layerId, layerData);
    }

    createlayer (layerData) {
        // TODO: Test this method when layer creation in tested with new wizard
        const mapLayer = this.mapLayerService.createMapLayer(layerData);

        if (layerData.baseLayerId) {
            // If this is a sublayer, add it to its parent's sublayer array
            this.mapLayerService.addSubLayer(layerData.baseLayerId, mapLayer);
        } else {
            // Otherwise just add it to the map layer service.
            if (this.mapLayerService._reservedLayerIds[mapLayer.getId()] !== true) {
                this.mapLayerService.addLayer(mapLayer);
            } else {
                this.setMessage('messages.errorInsertAllreadyExists', 'error');
                // should we update if layer already exists??? mapLayerService.updateLayer(e.layerData.id, e.layerData);
            }
        }
    }

    validateUserInputValues (layer) {
        const validationErrors = [];
        this.validateJsonValue(layer.styleJSON, 'messages.invalidStyleJson', validationErrors);
        this.validateJsonValue(layer.hoverJSON, 'messages.invalidHoverJson', validationErrors);
        this.validateJsonValue(layer.attributes, 'messages.invalidAttributeJson', validationErrors);
        return validationErrors;
    }

    validateJsonValue (value, msgKey, validationErrors) {
        if (value === '' || typeof value === 'undefined') {
            return;
        }
        try {
            const result = JSON.parse(value);
            if (typeof result !== 'object') {
                validationErrors.push({ key: msgKey, type: 'error' });
            }
        } catch (error) {
            validationErrors.push({ key: msgKey, type: 'error' });
        }
    }
    setLayerOptions (layer) {
        const styles = layer.styleJSON !== '' ? this.getMVTStylesWithSrcLayer(layer.styleJSON, layer.name) : undefined;
        const hoverStyle = layer.hoverJSON !== '' ? JSON.parse(layer.hoverJSON) : undefined;
        layer.options = { ...layer.options, ...{ styles: styles, hover: hoverStyle } };
        layer.options = JSON.stringify(layer.options);
    }

    deleteLayer () {
        // FIXME: This should use LayerAdmin route instead but this probably works anyway
        const { layer } = this.getState();
        fetch(Oskari.urls.getRoute('DeleteLayer'), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stringify(layer)
        }).then(response => {
            if (response.ok) {
                // TODO handle this, just close the flyout?
            } else {
                this.setMessage('messages.errorRemoveLayer', 'error');
            }
            return response;
        });
    }

    /*
        Calls action route like:
        http://localhost:8080/action?action_route=LayerAdmin&url=https://my.domain/geoserver/ows&type=wfslayer&version=1.1.0
    */
    fetchCapabilities (version) {
        this.ajaxStarted();
        const { layer } = this.getState();
        var params = {
            type: layer.type,
            version: version,
            url: layer.url
        };
        fetch(Oskari.urls.getRoute('LayerAdmin', params), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            this.ajaxFinished();
            if (response.ok) {
                this.updateState({
                    layer: { ...this.getState().layer, version }
                });
            } else {
                this.setMessage('TODO', 'error');
            }
            return response.json();
        }).then(json => {
            this.updateState({
                capabilities: json || {}
            });
        });
    }

    fetchRolesAndPermissionTypes () {
        this.ajaxStarted();
        fetch(Oskari.urls.getRoute('GetAllRolesAndPermissionTypes'))
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(new Error('Fetching user roles and permission types failed'));
                }
            }).then(data => {
                this.loadingCount--;
                this.updateState({
                    loading: this.isLoading(),
                    rolesAndPermissionTypes: data
                });
            }).catch(error => {
                this.log.error(error);
                this.setMessage('messages.errorFetchUserRolesAndPermissionTypes', 'error');
            });
    }

    getRolesAndPermissionTypes () {
        return this.getState().rolesAndPermissionTypes;
    };

    isLoading () {
        return this.loadingCount > 0;
    }

    clearMessages () {
        this.updateState({
            messages: []
        });
    }
}

const wrapped = controllerMixin(UIHandler, [
    'setType',
    'setLayerUrl',
    'setVersion',
    'layerSelected',
    'setUsername',
    'setPassword',
    'setLayerName',
    'setLocalizedLayerName',
    'setLocalizedLayerDescription',
    'setDataProvider',
    'setMapLayerGroup',
    'setOpacity',
    'setMinAndMaxScale',
    'setStyleJSON',
    'setHoverJSON',
    'setMetadataIdentifier',
    'setGfiContent',
    'setAttributes',
    'setMessage',
    'setMessages'
]);
export { wrapped as AdminLayerFormHandler };