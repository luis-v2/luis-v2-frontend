import { Injector, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dynamic',
  standalone: true,
})
export class DynamicPipe implements PipeTransform {

  public constructor(private injector: Injector) {}

  transform(value: any, pipeToken: any, pipeArgs: any): any {
    if (!pipeToken) {
        return value;
    }
    else {
        let pipe: any = this.injector.get(pipeToken, undefined, { optional: false });
        return pipe?.transform(value, pipeArgs);
    }
}

}
