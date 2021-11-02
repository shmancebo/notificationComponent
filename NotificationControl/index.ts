import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as signalR from "@aspnet/signalr";

export class NotificationControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _receivedMessage: string;
	private _notifyOutputChanged: () => void;
	private _context: ComponentFramework.Context<IInputs>;
	private connection: signalR.HubConnection;
	private _signalRApi: string;
	private _hub: string;
	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
	{
		this._context = context;
		this._notifyOutputChanged = notifyOutputChanged;
		this._signalRApi=context.parameters.SignalRUrl.raw?
		context.parameters.SignalRUrl.raw:"";
		this._hub=context.parameters.hubName.raw?
		context.parameters.hubName.raw:"";

		//Create the connection to SignalR Hub
		this.connection = new signalR.HubConnectionBuilder()
		.withUrl(this._signalRApi)
		.configureLogging(signalR.LogLevel.Information) // for debug
		.build();

		//configure the event when a new message arrives
		this.connection.on(this._hub, (message:string) => {
		this._receivedMessage=message;
		this._notifyOutputChanged();
		});

		//connect
		this.connection.start()
		.catch(err => console.log(err));
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
	}

	/**
	 * It is called by the framework prior to a control receiving new data.
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		//This code will run when we call notifyOutputChanged when we receive a new message
  //here is where the message gets exposed to outside
		let result: IOutputs = {
		Message: this._receivedMessage
		};
		return result;
		}

	/**
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		this.connection.stop();
	}
}
