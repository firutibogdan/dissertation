module Page exposing (Page(..),Msg, init, subscriptions, update, view)

import Page.Home as Home
import Page.Login as Login
import Page.Profile as Profile
import Page.Download as Download
import Page.NotFound as NotFound
import Route exposing (Route(..))
import Router exposing (Layout)
import Url exposing (Url)


{-| Page
-}
type Page
    = Home Home.Model
    | Login Login.Model
    | Profile Download.Model
    | Download Download.Model
    | NotFound Url


{-| Msg
-}
type Msg
    = HomeMsg Home.Msg
    | LoginMsg Login.Msg
    | ProfileMsg Profile.Msg
    | DownloadMsg Download.Msg


{-| init
-}
init : Route -> ( Page, Cmd Msg )
init route =
    case route of
        Route.Home ->
            Home.init ()
                |> Router.mapUpdate Home HomeMsg

        Route.Login ->
            Login.init ()
                |> Router.mapUpdate Login LoginMsg

        Route.Profile url ->
            Profile.init () url
                |> Router.mapUpdate Profile ProfileMsg

        Route.Download url ->
            Download.init () url
                |> Router.mapUpdate Download DownloadMsg

        Route.NotFound url ->
            ( NotFound url, Cmd.none )


{-| update
-}
update : Msg -> Page -> ( Page, Cmd Msg )
update message page = case message of
        HomeMsg msg ->
            case page of
                Home mdl ->
                    Home.update msg mdl
                        |> Router.mapUpdate Home HomeMsg

                _ ->
                    ( page, Cmd.none )
        LoginMsg msg ->
            case page of
                Login mdl ->
                    Login.update msg mdl
                        |> Router.mapUpdate Login LoginMsg

                _ ->
                    ( page, Cmd.none )
        DownloadMsg msg ->
            case page of
                Download mdl ->
                    Download.update msg mdl
                        |> Router.mapUpdate Download DownloadMsg

                _ ->
                    ( page, Cmd.none )
        ProfileMsg msg ->
            case page of
                Profile mdl ->
                    Profile.update msg mdl
                        |> Router.mapUpdate Profile ProfileMsg

                _ ->
                    ( page, Cmd.none )


{-| view
-}
view : Page -> Layout Msg
view page =
    case page of
        Home mdl ->
            Home.view mdl
                |> Router.mapView HomeMsg

        Login mdl ->
            Login.view mdl
                |> Router.mapView LoginMsg

        Profile mdl -> 
            Profile.view mdl
                |> Router.mapView ProfileMsg

        Download mdl ->
            Download.view mdl
                |> Router.mapView DownloadMsg

        NotFound url ->
            NotFound.view url


{-| subscriptions
-}
subscriptions : Page -> Sub Msg
subscriptions page =
    case page of
        Home mdl -> 
            Sub.none

        Login mdl ->
            Sub.none

        Profile mdl -> 
            Sub.none

        Download mdl -> 
            Sub.none

        NotFound _ ->
            Sub.none