export interface App extends Component {
    runnable: string;
    runnableArguments?: any[];
}
export interface Component {
    dependencies?: Component[];
    serviceProviders: ServiceProvider[];
}
export interface Cudo {
    run: (app: App) => Promise<void>;
}
export interface Service {
}
export interface ServiceProvider {
    createService: (...serviceDependencies: Service[]) => Promise<Service>;
    serviceDependencyNames?: string[];
    serviceName: string;
}
declare const cudo: Cudo;
export default cudo;
