import { RouterModule, Routes } from '@nestjs/core'
import { Module, ModuleMetadata } from '@nestjs/common'
import { EntryModule } from './entry/entry.module'

const v1Routes: Routes = [
  {
    path: '/v1',
    children: [{ path: '/entry', module: EntryModule }],
  },
]

const routes: Routes = [{ path: '/api', children: v1Routes }]

const getModulesFromRoutes = (routes: Routes) => {
  const modules: ModuleMetadata['imports'] = []

  for (const route of routes) {
    if (route.module) {
      modules.push(route.module)
    }
    if (route.children) {
      modules.push(...getModulesFromRoutes(route.children as Routes))
    }
  }
  return modules
}

@Module({
  imports: [RouterModule.register(routes), ...getModulesFromRoutes(routes)],
})
export class ApiModule {}
